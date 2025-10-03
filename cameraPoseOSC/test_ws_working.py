#!/usr/bin/env python3
"""
WebSocket OSC Server compatible with osc-js library
"""

import asyncio
import websockets
from pythonosc.osc_packet import OscPacket
from pythonosc.osc_message_builder import OscMessageBuilder

async def send_keepalive(websocket):
    """Send regular keepalive messages to prevent timeout"""
    while True:
        try:
            # Build a minimal /depth message with correct types
            builder = OscMessageBuilder(address="/depth")
            builder.add_arg(160, 'i')  # width as integer
            builder.add_arg(120, 'i')  # height as integer
            builder.add_arg(bytes([0]), 'b')   # minimal blob with single zero byte
            builder.add_arg(0.5, 'f')  # x as float
            builder.add_arg(0.5, 'f')  # y as float
            builder.add_arg(0.0, 'f')  # z as float
            builder.add_arg(1, 'i')    # tracking as integer (1 = true)
            
            # Send the message
            message = builder.build().dgram
            await websocket.send(message)
            
    
            # Wait 1 second before next keepalive
            await asyncio.sleep(1)
            
        except websockets.exceptions.ConnectionClosed:
            break
        except Exception as e:
            print(f"Keepalive error: {e}")
            break

async def handle_client(websocket):
    """Handle WebSocket connection and messages"""
    client_addr = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    print(f"🔗 Client connected: {client_addr}")
    
    # Start keepalive task
    keepalive_task = asyncio.create_task(send_keepalive(websocket))
    
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                print(f"📥 Binary message: {len(message)} bytes")
                try:
                    packet = OscPacket(message)
                    if hasattr(packet, 'address') and hasattr(packet, 'params'):
                        print(f"   📡 OSC Message:")
                        print(f"      Address: {packet.address}")
                        print(f"      Parameters: {packet.params}")
                except Exception as e:
                    print(f"   ❌ OSC parse error: {e}")
            else:
                print(f"📥 Text message: {message}")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"🔐 Client disconnected: {client_addr}")
    except Exception as e:
        print(f"❌ Error with client {client_addr}: {e}")
    finally:
        # Clean up keepalive task
        keepalive_task.cancel()
        try:
            await keepalive_task
        except asyncio.CancelledError:
            pass

async def start_server():
    """Start the WebSocket server"""
    host = "0.0.0.0"  # Listen on all available interfaces
    port = 8025
    
    print(f"🚀 Starting WebSocket OSC server on ws://{host}:{port}")
    print("   Sending keepalive messages every 1 second")
    print("   Waiting for connections...")
    print("   Press Ctrl+C to stop")
    
    async with websockets.serve(
        handle_client, 
        host, 
        port,
        subprotocols=["osc"]
    ) as server:
        await asyncio.Future()  # Run forever

def main():
    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")

if __name__ == "__main__":
    main()