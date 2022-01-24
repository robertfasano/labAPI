from threading import Thread
import sched
import time
import logging

class Task:
    def __init__(self, target, period, type=None):
        self.target = target
        self.period = period
        self.active = False
        self.paused = False
        self.thread = None
        self.type = type

    def __start__(self):
        self.active = True
        self.thread = Thread(target=self.__run_periodic__)
        self.thread.start()
        return self

    def __stop__(self):
        self.active = False

    def __run_periodic__(self):
        ''' If a period is passed, uses Python's sched library to
            avoid timing drifts. Make sure that the passed period is longer than
            the time required to call the target function.

            Args:
                period (float): the repetition time in seconds
        '''
        logging.info('Starting monitoring loop.')
        scheduler = sched.scheduler(time.time, time.sleep)

        last_time = time.time()
        while self.active:
            if self.paused:
                continue
            new_time = time.time()
            if last_time < new_time:
                logging.warn('Warning: skipping missed tasks and resyncing the time cursor.')
                last_time = new_time
                continue
            scheduler.enterabs(last_time, 1, self.target)
            last_time += self.period

            scheduler.run()
