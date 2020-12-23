''' A script for running the API in debug mode for front-end development '''
from labAPI import Environment, Instrument, Knob, Switch, Measurement, Selector, Monitor, Watcher
import numpy as np
import webbrowser

class Laser(Instrument):
    def __init__(self, name='Laser'):
        super().__init__(name=name)
        self.current = Knob('current', 126, bounds=(0, 130))
        self.voltage = Knob('piezo voltage', 74.6, bounds=(0, 140))
        self.emission = Switch('emission', False)
        self.wavemeter = Measurement('wavemeter', self.read_wavemeter)
        self.temperature = Measurement('Temperature', get_cmd=lambda: np.random.normal(20, 1), default_unit='C')
        self.temperature.add_unit('F', lambda T: 32+9/5*T)

    def read_wavemeter(self):
        return 751879.7 + (self.current.get()-126)*20 + (self.voltage.get()-75)*400/5 + np.random.normal(0, 0.1)

class IntensityServo(Instrument):
    def __init__(self, name='IntensityServo'):
        super().__init__(name=name)
        self.setpoint = Knob('setpoint', 4.1, bounds=(0, 5))
        self.lock = Switch('lock', False)
        self.channel = Selector('channel', 0, [0, 1, 2])
        self.intensity = Measurement('Intensity', get_cmd=lambda: np.random.normal(3.5, 0.1), default_unit='V')
        self.intensity.add_unit('mW', lambda P: 45*P)

class PMT(Instrument):
    def __init__(self, name='PMT'):
        super().__init__(name=name)
        self.voltage = Knob('gain', 0.7, bounds=(0, 1))
        self.fluorescence = Measurement('fluorescence', self.measure_fluorescence)

    def measure_fluorescence(self):
        return (10**self.voltage) * (1+np.random.normal(0, 0.01))

def test_example(test=True, host=False):
    laser = Laser()
    servo = IntensityServo()

    pmt = PMT()

    env = Environment()
    env.watch(pmt.fluorescence, laser.wavemeter, laser.temperature, servo.intensity)
    if host:
        env.host('127.0.0.1:5000', debug=False)
        webbrowser.open('127.0.0.1:5000')
    if test:
        env.monitor.stop()
