from labAPI import Task
import pandas as pd
import datetime
import os

class Monitor:
    def __init__(self, environment, period=1, filename=None):
        self.environment = environment
        self.paused = True
        self.tasks = {}
        self.data = pd.DataFrame()
        self.filename = filename

        ## define a logger task which aggregates software values polled by individual monitoring threads
        self.tasks['__logger__'] = Task(self.snapshot, period)

        ## define a monitoring thread for each instrument
        for inst in environment.instruments.values():
            self.tasks[inst.name] = Task(inst.snapshot, period)

        ## create individual tasks for uncategorized parameters
        for key, param in self.environment.parameters.items():
            if key.split('/')[0] == 'uncategorized':
                self.tasks[param.name] = Task(param.snapshot, period)

        for task in self.tasks.values():
            task.__start__()

    def pause(self):
        for task in self.tasks.values():
            task.paused = True
        self.paused = True

    def resume(self):
        for task in self.tasks.values():
            task.paused = False
        self.paused = False

    def snapshot(self):
        state = self.environment.snapshot(deep=False, refresh=False, fire_callbacks=True)
        state = pd.DataFrame(state, index=[datetime.datetime.now()])
        self.data = pd.concat([self.data, state])

        try:
            if self.filename is not None:
                if os.path.exists(self.filename):
                    self.data.to_csv(self.filename, mode='a', header=False)
                else:
                    self.data.to_csv(self.filename, mode='w', header=True)
        except PermissionError:
            pass
