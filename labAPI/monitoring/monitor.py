import datetime
import time
import sched
import os
from threading import Thread
import pandas as pd
from . import Watcher, Listener
from .extensions import FileLogger
from labAPI import Task

class Monitor(Task):
    ''' Implements periodic or triggered monitoring of any functions passed to
        the Monitor.watch() method. Extensions can be added using the
        Monitor.add_extension() method, adding features like realtime plotting,
        ZeroMQ pub/sub feeds, and writing to an Influx database.
    '''
    def __init__(self, filename=None, period=None, resampling_interval=datetime.timedelta(seconds=1), max_points=65536):
        '''
        Args:
            period (float): sampling period in seconds.
            filename (str): optional filename for logging to CSV
            measurement (str): optional measurement name for logging to InfluxDB

            max points (int): number of points to store in memory (FIFO basis).
            resampling interval (str): interval with which to bin incoming data.
                                       Value should be formatted as a pandas
                                       offset alias, e.g. '1s' for resampling to
                                       one second intervals. Leave blank to disable
                                       resampling.
        '''
        super().__init__(type='monitor')
        self.period = period
        self.resampling_interval = resampling_interval
        self.max_points = max_points

        self.observers = {}
        self.callbacks = {}

        self.data = pd.DataFrame()

        if filename is not None:
            self.add_extension(FileLogger(filename=filename))

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

    def watch(self, name, experiment, threshold=(None, None), reaction=None):
        ''' Add a variable to be monitored actively (querying a method for new
            results with each measurement cycle).
            Args:
                name (str): A unique name for the experiment.
                experiment (callable): a function or other callable. Should take
                                       no arguments and return a numerical value.
                threshold (tuple): lower and upper threshold. Pass None to either
                                   threshold to deactivate it.
                reaction (function): optional action to take when the variable
                                     exits defined thresholds.
        '''
        if name is None:
            name = experiment.__name__

        self.observers[name] = Watcher(name, experiment, threshold=threshold, reaction=reaction)


    def listen(self, name, address, threshold=(None, None), reaction=None):
        ''' Add a variable to be monitored passively (initiated from the variable,
            not the monitor).
            Args:
                name (str): label with which to store the data
                address (str): address of data feed, e.g. '127.0.0.1:8000'
                threshold (tuple): lower and upper threshold. Pass None to either
                                   threshold to deactivate it.
                reaction (function): optional action to take when the variable
                                     exits defined thresholds.
        '''
        if category not in self.categories:
            self.categories[category] = {}
        field = category + '/' + name
        self.observers[name] = Listener(name, address, threshold=threshold, reaction=reaction)

    def add_extension(self, extension):
        ''' Add an extension by registering its update() method as a callback '''
        self.callbacks[extension.__class__] = extension.update

    def check(self):
        ''' Check all attached watchers and optionally log the result, update
            the plot, and/or call the callback.

            If a value is out of threshold, enter the Alert state.
        '''
        new_data = pd.DataFrame()

        items = self.observers.items()
        for name, observer in items:
            observation = observer.measure()
            if len(observation) != 0:
                new_data = new_data.append(observation, sort=False)

        for callback in self.callbacks.values():
            callback(new_data)

        return new_data

    @staticmethod
    def resample(data, freq='1s'):
        ''' Bin observations into the passed frequency '''
        data = data.reset_index().groupby(pd.Grouper(key='index', freq=freq)).mean()  # resample
        return data

    def start(self):
        self.__start__(self.check, period=self.period)

    def stop(self):
        ''' Stop acquisition. '''
        self.__stop__()
