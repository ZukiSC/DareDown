/**
 * Mock WebRTC Service for DareDown
 *
 * IMPORTANT: This is a MOCK service for frontend demonstration purposes.
 * In a real-world application, you would use a signaling server (e.g., using WebSockets with Socket.IO)
 * to exchange WebRTC information (SDP offers/answers and ICE candidates) between clients.
 * This file simulates that exchange using local variables and timeouts to mimic asynchronicity.
 */

// A mock "signaling server" state. In a real app, this would live on your server.
let mockSignalingChannel = {
  offer: null as RTCSessionDescriptionInit | null,
  answer: null as RTCSessionDescriptionInit | null,
  streamerCandidates: [] as RTCIceCandidate[],
  viewerCandidates: [] as RTCIceCandidate[],
  reset: function() {
    this.offer = null;
    this.answer = null;
    this.streamerCandidates = [];
    this.viewerCandidates = [];
  }
};

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // In a production environment, you would also have TURN servers here
    // for clients behind restrictive firewalls.
  ],
};

const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to the connection so they can be sent to the peer
    if (localStream) {
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream!);
        });
    }

    return pc;
};


export const rtcService = {
  /**
   * Called by the loser (streamer) to start their camera and initiate the connection.
   */
  startStream: async (): Promise<MediaStream> => {
    mockSignalingChannel.reset();
    
    // 1. Get user's camera and microphone
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    peerConnection = createPeerConnection();
    
    // 2. Listen for ICE candidates and "send" them to the mock signaling channel
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Streamer: Generated ICE candidate", event.candidate);
        // In a real app: socket.emit('ice-candidate', event.candidate);
        mockSignalingChannel.streamerCandidates.push(event.candidate);
      }
    };
    
    // 3. Create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // 4. "Send" the offer to the signaling channel
    console.log("Streamer: Created and sent offer.");
    // In a real app: socket.emit('webrtc-offer', offer);
    mockSignalingChannel.offer = offer;
    
    // 5. SIMULATE waiting for an answer from a viewer
    return new Promise((resolve) => {
        const checkForAnswer = setInterval(async () => {
           if(mockSignalingChannel.answer) {
               console.log("Streamer: Received answer.");
               clearInterval(checkForAnswer);
               await peerConnection?.setRemoteDescription(mockSignalingChannel.answer);
               
               // Also add any candidates the viewer might have sent
               for (const candidate of mockSignalingChannel.viewerCandidates) {
                   await peerConnection?.addIceCandidate(candidate);
               }
           }
        }, 500);
        resolve(localStream!);
    });
  },

  /**
   * Called by viewers to connect to the loser's stream.
   */
  viewStream: async (): Promise<MediaStream> => {
    return new Promise((resolve, reject) => {
      
      const waitForOffer = setInterval(async () => {
        if (mockSignalingChannel.offer) {
          clearInterval(waitForOffer);
          console.log("Viewer: Received offer.");
          
          peerConnection = createPeerConnection();
          
          // When a remote track is received, resolve the promise with the stream
          peerConnection.ontrack = (event) => {
            console.log("Viewer: Received remote track.");
            resolve(event.streams[0]);
          };

          // Listen for ICE candidates and "send" them
          peerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                  console.log("Viewer: Generated ICE candidate", event.candidate);
                  // In a real app: socket.emit('ice-candidate', event.candidate);
                  mockSignalingChannel.viewerCandidates.push(event.candidate);
              }
          };

          await peerConnection.setRemoteDescription(mockSignalingChannel.offer);
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          console.log("Viewer: Created and sent answer.");
          // In a real app: socket.emit('webrtc-answer', answer);
          mockSignalingChannel.answer = answer;
          
          // Add any candidates the streamer may have already sent
          for (const candidate of mockSignalingChannel.streamerCandidates) {
             await peerConnection?.addIceCandidate(candidate);
          }
        }
      }, 500);

      // Timeout if no offer is received
      setTimeout(() => {
        clearInterval(waitForOffer);
        reject(new Error("Timeout: No stream offer received."));
      }, 10000);
    });
  },

  /**
   * Cleans up the connection and local media streams.
   */
  closeConnection: () => {
    peerConnection?.close();
    peerConnection = null;
    localStream?.getTracks().forEach(track => track.stop());
    localStream = null;
    mockSignalingChannel.reset();
    console.log("RTC connection closed and cleaned up.");
  }
};