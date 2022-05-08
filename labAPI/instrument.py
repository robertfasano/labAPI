''' The Instrument class is a container for Parameters belonging to a single
    device. 
'''
from labAPI import Parameter
import logging

class Instrument:
    def __init__(self, name):
        self.name = name

    def connect(self, address):
        pass

    def __repr__(self):
        return "Instrument('{}')".format(self.name)

    def index(self):
        self.__parameters__ = {}
        for item in self.__dict__.values():
            if isinstance(item, Parameter):
                self.__parameters__[item.name] = item
                logging.debug(f'Discovered Parameter: {item.name}')

    def snapshot(self, deep=False, refresh=True):
        state = {}
        for p in self.__parameters__.values():
            state[p.name] = p.snapshot(deep=deep, refresh=refresh)

        return state
