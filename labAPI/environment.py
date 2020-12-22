import gc
from labAPI import Parameter, Instrument, API, Monitor, Measurement
import logging
import datetime

def is_in(element, lst):
    ''' Checks if the element is in the list by exact reference '''
    for elem in lst:
        if element is elem:
            return True
    return False

class Environment:
    def __init__(self, resampling_interval=datetime.timedelta(seconds=1), logfile=None):
        self.resampling_interval = resampling_interval
        self.monitor = Monitor(period=1, resampling_interval=resampling_interval, filename=logfile)

        print('Starting LabAPI environment...')
        self.all_instruments, self.all_parameters = self.discover()
        self.instruments, self.parameters = self.index()
        print('Finished environment discovery.')
        self.snapshot(log=True)

        self.monitor.start()

    def get_parent(self, obj):
        ''' Finds the parent object of the specified Instrument or Parameter '''
        for item in self.all_instruments:
            if is_in(obj, item.__dict__.values()):
                return item

    def get_address(self, obj):
        ''' Assembles the full device hierarchy address of the specified Instrument or Parameter '''
        addr = [obj.name]
        while True:
            obj = self.get_parent(obj)
            if obj is None:
                break
            addr.append(obj.name)
        addr.reverse()
        return '/'.join(addr)

    def host(self, addr='127.0.0.1:8000', debug=False):
        print('Running LabAPI server on', addr)
        self.api = API(self, addr=addr.split(':')[0], port=addr.split(':')[1], debug=debug)
        self.api.run()

    def index(self):
        ''' Sorts discovered instruments and parameters into dictionaries with each
            object indexed by a unique address.
        '''
        instruments = {}
        parameters = {}

        for item in self.all_instruments:
            addr = self.get_address(item)
            if addr in instruments:
                logging.warning(f'Warning: overwriting duplicate instrument: {addr}')
            instruments[addr] = item

        for item in self.all_parameters:
            addr = self.get_address(item)
            if addr in parameters:
                logging.warning(f'Warning: overwriting duplicate parameter: {addr}')

            parameters[self.get_address(item)] = item

        return instruments, parameters

    def discover(self):
        ''' Searches for and returns lists of all Instrument and Parameter objects
            currently tracked by the garbage collector.
        '''
        all_instruments, all_parameters = [], []
        for item in gc.get_objects():
            if isinstance(item, Instrument):
                all_instruments.append(item)
                print('Discovered Instrument:', item.name)
            elif isinstance(item, Parameter):
                all_parameters.append(item)
                print('Discovered Parameter:', item.name)
                item.callbacks['environment'] = lambda value: self.snapshot(log=True)

        return all_instruments, all_parameters

    @staticmethod
    def unflatten(snapshot):
        def nest(path, container, addr):
            split = path.split('/')
            head = split[0]
            tail = split[1:]
            if not tail:
                container[head] = snapshot[addr]
            else:
                if head not in container:
                    container[head] = {}
                nest('/'.join(tail), container[head], addr)

        nested_state = {}
        for addr in snapshot:
            nest(addr, nested_state, addr)
        return nested_state

    def snapshot(self, deep=False, nested=False, log=False):
        ''' Stores all current parameter values in a dictionary '''
        state = {}
        for p in self.parameters:
            state[p] = self.parameters[p].snapshot(deep)

        if log:
            # log only default units for measurements
            for name, parameter in self.parameters.items():
                if isinstance(parameter, Measurement):
                    state[name] = state[name][parameter.default_unit]
            self.monitor.append(state)
        if nested:
            return self.unflatten(state)
        return state

    @property
    def snapshots(self):
        return self.monitor.data

    def sync(self):
        ''' Request updated values from all parameters '''
        return dict([(p, self.parameters[p].get()) for p in self.parameters])

    def watch(self, *parameters):
        for p in parameters:
            addr = self.get_address(p)
            self.monitor.watch(addr, p.get)

    def react(self, parameter, threshold=(None, None), reaction=None):
        addr = self.get_address(parameter)
        self.observers[addr]._threshold = threshold
        self.observers[addr].react = reaction
