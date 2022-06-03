from labAPI import Task

class Monitor:
    def __init__(self, environment, period=1):
        self.environment = environment
        self.paused = True
        self.tasks = {}

        ## define a logger task which aggregates software values polled by individual monitoring threads
        self.tasks['__logger__'] = Task(lambda: environment.snapshot(deep=False, refresh=False, fire_callbacks=True), period)

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