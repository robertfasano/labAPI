''' A script for running the API in debug mode for front-end development '''
from labAPI import Environment, Knob, Measurement
import numpy as np

def test_example(test=True, host=False):
    x = Knob('x', 0)
    y = Measurement('y', get_cmd = lambda: x.get()**2*(1+np.random.normal(0, 0.01))+np.random.normal(0, 0.01), monitor=True)
    if host:
        env = Environment()
        env.monitor.resume()
        env.host('127.0.0.1:9010')

        