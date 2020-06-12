import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

print "Setup LED pins as outputs"

GPIO.setup(4, GPIO.OUT)
GPIO.output(4, False)

GPIO.output(4, True)

time.sleep(10000)

GPIO.output(4, False)

raw_input('press enter to exit program')

GPIO.cleanup()