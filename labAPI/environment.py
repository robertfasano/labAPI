import gc
from labAPI import Parameter, Instrument, Server, Monitor
import logging
logger = logging.getLogger('labAPI')
from contextlib import contextmanager
import json

def is_in(element, lst):
    ''' Checks if the element is in the list by exact reference '''
    for elem in lst:
        if element is elem:
            return True
    return False

class Environment:
    def __init__(self, period=1, logfile='', defaults='./state.json', data_file=None):
        '''
        Args:
            period (float): sampling period in seconds.
        '''
        self.period = period
        self.callbacks = {}
        if logfile != '':
            logging.basicConfig(format='%(asctime)s.%(msecs)03d %(levelname)s [%(module)s.%(funcName)s] %(message)s', 
                                datefmt='%Y-%m-%dT%H:%M:%S', 
                                level=logging.INFO, 
                                filename=logfile, 
                                filemode='a')
        else:
            logging.basicConfig(format='%(asctime)s.%(msecs)03d %(levelname)s [%(module)s.%(funcName)s] %(message)s', 
                    datefmt='%Y-%m-%dT%H:%M:%S', 
                    level=logging.INFO)

        logger.debug('Starting LabAPI environment...')
        self.all_instruments, self.all_parameters = self.discover()
        self.instruments, self.parameters = self.index()

        for inst in self.all_instruments:
            inst.index()

        for p in self.all_parameters:
            p.__address__ = self.get_address(p)

        logger.debug('Finished environment discovery.')

        ## load default parameters from file if it exists
        try:
            with open(defaults, 'r') as file:
                params = json.load(file)
            logger.info(f'Loading parameter defaults from {defaults}.')
        except FileNotFoundError:
            params = {}
        for key, val in params.items():
            if key in self.parameters:
                self.parameters[key].set(val)

        self.monitor = Monitor(self, period=period, filename=data_file)

    @staticmethod
    @contextmanager
    def handle():
        ''' Returns a handle to the Environment within the local kernel '''
        resource = None
        for item in gc.get_objects():
            if isinstance(item, Environment):
                resource = item
                break
        try:
            yield resource
        finally:
            del resource

    @staticmethod
    @contextmanager
    def lookup(addr):
        ''' Provides a context manager for access of instruments or parameters
            within the local Environment.
            Example:
                with Environment.lookup("wavemeter") as wm:
                    print(wm.frequency)
                with Environment.lookup('wavemeter/frequency') as freq:
                    print(freq)
            These two examples are identical in behavior.
        '''
        resource = None
        with Environment.handle() as env:
            if addr in env.instruments:
                resource = env.instruments[addr]
            elif addr in env.parameters:
                resource = env.parameters[addr]
            try:
                yield resource
            finally:
                del resource

    @staticmethod
    @contextmanager
    def pause():
        ''' Provides a context manager to execute code while the monitor is paused to avoid resource conflicts.
            Example:
                original_pause_state = env.monitor.paused
                with Environment.pause():
                    print(env.monitor.paused)   # prints True
                    # do other stuff
                print(env.monitor.paused)       # returns to original_pause_state (either True or False)
        '''
        with Environment.handle() as env:
            original_state = env.monitor.paused
            env.monitor.pause()
        
            try:
                yield None
            finally:
                if not original_state:
                    env.monitor.resume()

    @staticmethod
    def cancel():
        with Environment.handle() as env:
            canceled = len(env.server.task_manager.queue) == 0
        return canceled

    def clear(self):
        ''' Clears all tasks in the task manager queue. '''
        self.server.task_manager.clear()

    def get_parent(self, obj):
        ''' Finds the parent object of the specified Instrument or Parameter '''
        for item in self.all_instruments:
            if is_in(obj, item.__dict__.values()):
                return item

    def get_address(self, obj):
        ''' Assembles the full device hierarchy address of the specified Instrument or Parameter '''
        addr = [obj.name]

        parent = obj
        while True:
            parent = self.get_parent(parent)
            if parent is None:
                break
            addr.append(parent.name)
        addr.reverse()
        if len(addr) == 1 and isinstance(obj, Parameter):
            addr = ['uncategorized', *addr]
        return '/'.join(addr)

    def host(self, addr='127.0.0.1:8000', debug=False):
        logger.info(f'Running LabAPI server on {addr}')

        self.server = Server(self, addr=addr.split(':')[0], port=addr.split(':')[1], debug=debug)
        self.server.run()

    def index(self):
        ''' Sorts discovered instruments and parameters into dictionaries with each
            object indexed by a unique address.
        '''
        instruments = {}
        parameters = {}

        for item in self.all_instruments:
            addr = self.get_address(item)
            if addr in instruments:
                logger.warning(f'Warning: overwriting duplicate instrument: {addr}')
            instruments[addr] = item

        for item in self.all_parameters:
            addr = self.get_address(item)
            if addr in parameters:
                logger.warning(f'Warning: overwriting duplicate parameter: {addr}')

            parameters[addr] = item

        return instruments, parameters

    def discover(self):
        ''' Searches for and returns lists of all Instrument and Parameter objects
            currently tracked by the garbage collector.
        '''
        all_instruments, all_parameters = [], []
        for item in gc.get_objects():
            if isinstance(item, Instrument):
                all_instruments.append(item)
                logger.debug(f'Discovered Instrument: {item.name}')
            elif isinstance(item, Parameter):
                all_parameters.append(item)
                logger.debug(f'Discovered Parameter: {item.name}')

        return all_instruments, all_parameters

    def snapshot(self, deep=False, refresh=True, fire_callbacks=False):
        ''' Stores all current parameter values in a dictionary '''
        state = {}
        for p in self.parameters:
            parameter = self.parameters[p]
            state[p] = parameter.snapshot(deep, refresh=refresh)

        ''' LabAPI internal parameters '''
        if deep:
            state['labAPI/monitor/paused'] = {'value': self.monitor.paused}
        else:
            state['labAPI/monitor/paused'] = self.monitor.paused

        if fire_callbacks:
            for callback_name, callback in self.callbacks.items():
                try:
                    callback(state)
                except Exception as e:
                    logger.debug(f'Error in Environment callback {callback_name}:')
                    logger.debug(e)

        return state
