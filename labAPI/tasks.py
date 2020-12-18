from threading import Thread
import sched
import time

class Task:
    def __init__(self, type=None):
        self.active = False
        self.paused = False
        self.thread = None
        self.type = type

    def __start__(self, target, period):
        self.active = True
        self.thread = Thread(target=self.__run_periodic__, kwargs={'target': target, 'period': period})
        self.thread.start()

    def __stop__(self):
        self.active = False

    def __run_periodic__(self, target, period):
        ''' If a period is passed, uses Python's sched library to
            avoid timing drifts. Make sure that the passed period is longer than
            the time required to call the target function.

            Args:
                period (float): the repetition time in seconds
        '''
        scheduler = sched.scheduler(time.time, time.sleep)

        last_time = time.time()
        while self.active:
            if self.paused:
                continue
            if last_time < time.time():
                print('Warning: skipping missed tasks and resyncing the time cursor.')
                last_time = time.time()
                continue
            scheduler.enterabs(last_time, 1, target)
            last_time += period

            scheduler.run()
