from labAPI import Task

class Monitor:
    def __init__(self, environment, period=1):
        self.environment = environment
        self.paused = False
        self.tasks = {}

        self.tasks['__logger__'] = Task(lambda: environment.snapshot(deep=False, refresh=False, fire_callbacks=True), period)

        for inst in environment.instruments.values():
            self.tasks[inst.name] = Task(inst.snapshot, period)

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