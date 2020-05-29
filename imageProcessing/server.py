#server.py
#!/usr/bin/python
import socket
import cv2
import numpy
import time
import json
import findPos as op

def recvall(sock, count):
       buf = b''
       while count:
           newbuf = sock.recv(count)
           if not newbuf: return None
           buf += newbuf
           count -= len(newbuf)
       return buf

TCP_IP = '192.168.0.30'
TCP_PORT = 10210

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print('Socket created')

s.bind((TCP_IP, TCP_PORT))
print('Socket bind complete')

s.listen(True)
print('Socket now listening')

while True:
       conn, addr = s.accept()
       print('received!!')

       length = recvall(conn,16)
       stringData = recvall(conn, int(length))
       data = numpy.frombuffer(stringData, dtype='uint8')

       decimg=cv2.imdecode(data, cv2.IMREAD_COLOR)

       arr = op.openPos(decimg)

       conn.sendall(str(arr).encode())

s.close()


