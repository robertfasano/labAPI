import gc
from labAPI import Parameter, Instrument, API, Measurement, Task
import logging
import datetime
from contextlib import contextmanager
import pandas as pd 
import os 

def is_in(element, lst):
    ''' Checks if the element is in the list by exact reference '''
    for elem in lst:
        if element is elem:
            return True
    return False

class Environment:
    def __init__(self, period=1, max_points=65536, resampling_interval=datetime.timedelta(seconds=1), log_interval=datetime.timedelta(seconds=60), datafile='', logfile=''):
        '''
        Args:
            period (float): sampling period in seconds.
            max points (int): number of points to store in memory (FIFO basis).
            resampling interval (datetime.timedelta): interval with which to bin incoming data.
            datafile (str): filename to use for data logging
            log_interval (datetime.timedelta): interval between writing chunks of data to file
        '''
        self.resampling_interval = resampling_interval
        self.log_interval = log_interval
        self.log_time = datetime.datetime.now()
        self.max_points = max_points
        self.period = period

        self.callbacks = {}

        if logfile == '':
            logfile = datafile.replace('.csv', '.log')

        if logfile != '':
            logging.basicConfig(format='%(asctime)s.%(msecs)03d %(levelname)s [%(module)s.%(funcName)s] %(message)s', 
                                datefmt='%Y-%m-%dT%H:%M:%S', 
                                level=logging.INFO, 
                                filename=logfile, 
                                filemode='a')

        logging.info('Starting LabAPI environment...')
        self.all_instruments, self.all_parameters = self.discover()
        self.instruments, self.parameters = self.index()
        logging.info('Finished environment discovery.')



        self.data = pd.DataFrame()
        self.datafile = datafile
        if os.path.isfile(datafile):
            self.data = pd.read_csv(datafile, index_col=0)
            self.data.index = pd.DatetimeIndex(self.data.index)

        self.snapshot(log=True)
        # self.run_monitor()


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
        if len(addr) == 1 and isinstance(obj, Parameter):
            addr = ['uncategorized', *addr]
        return '/'.join(addr)

    def host(self, addr='127.0.0.1:8000', debug=False):
        print('Running LabAPI server on', addr)
        logging.info(f'Running LabAPI server on {addr}')

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
                logging.info(f'Discovered Instrument: {item.name}')
            elif isinstance(item, Parameter):
                all_parameters.append(item)
                logging.info(f'Discovered Parameter: {item.name}')
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
            # for name, parameter in self.parameters.items():
            #     if isinstance(parameter, Measurement):
            #         state[name] = state[name][parameter.default_unit]

            # self.monitor.append(state)
            self.append(state)

        for callback in self.callbacks.values():
            callback(state)

        if nested:
            return self.unflatten(state)
        return state

    def sync(self):
        ''' Request updated values from all parameters '''
        return dict([(p, self.parameters[p].get()) for p in self.parameters])

    ## monitoring
    def append(self, state):
        ''' Append a new observation or set of observations to the dataset. Aggregate
            data by the resampling interval by resampling on a rolling set of data. '''
        now = datetime.datetime.now()
        self.data = self.data.append(pd.DataFrame(state, index=[now]), sort=False)

        ''' resample recent data '''
        recent_data = self.data[self.data.index >= now-self.resampling_interval]
        recent_data = recent_data.resample(self.resampling_interval).mean().dropna(how='all')
        self.data = self.data[self.data.index < now-self.resampling_interval].append(recent_data, sort=False)

        ''' avoid overflows '''
        overflow = len(self.data) - self.max_points
        if overflow > 0:
            self.data.drop(self.data.head(overflow).index, inplace=True)

        ''' write to file '''
        if now - self.log_time > self.log_interval:
            logging.info(f'Writing to file at {now.isoformat()}')

            recent_data = self.data[self.data.index >= self.log_time]
            self.write(recent_data)
            self.log_time = now

    @staticmethod
    def resample(data, freq='1s'):
        ''' Bin observations into the passed frequency '''
        data = data.reset_index().groupby(pd.Grouper(key='index', freq=freq)).mean()  # resample
        return data

    def run_monitor(self):
        self.monitor_task = Task()
        target = lambda: self.snapshot(log=True)
        self.monitor_task.__start__(target, self.period)

    def write(self, data):
        ''' Append the latest measurement to file. If the file does not exist,
            headers matching the columns in self.data are written first.
            Args:
                data (pandas.DataFrame): the most recent measurement
        '''
        if not os.path.isfile(self.datafile):
            data.to_csv(self.datafile, header=True)
        else:
            data.to_csv(self.datafile, mode='a', header=False)
