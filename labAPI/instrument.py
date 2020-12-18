''' The Instrument class is a container for Parameters belonging to a single
    device. 
'''
from labAPI import Parameter

class Instrument:
    def __init__(self, name):
        self.name = name

    def connect(self, address):
        pass

    def __repr__(self):
        return "Instrument('{}')".format(self.name)
