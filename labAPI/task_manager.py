from threading import Thread
import logging
import time
logger = logging.getLogger('labAPI')

class TaskManager:
    ''' Schedules functions for non-simultaneous execution '''
    def __init__(self, environment):
        self.environment = environment
        self.queue = []
        self.thread = Thread(target=self.run)
        self.thread.start()
        
    def add(self, addr):
        logger.debug(f'Scheduled task: {addr}. Position in queue: {len(self.queue)+1}.')
        self.queue.append(addr)

    def execute(self, addr):
        logger.info(f'Running task: {addr}')
        if '/' not in addr:
            addr = 'uncategorized/' + addr
        parameter = self.environment.parameters[addr]
        result = parameter()

        if len(self.queue) != 0:
            logger.info(f'Finished task: {addr}')


    def run(self):
        while True:
            if len(self.queue) == 0:
                time.sleep(0.1)
                continue
            with self.environment.pause():
                address = self.queue[0]
                try:
                    self.execute(address)
                    self.queue.pop(0)
                except Exception as e:
                    pass

    def clear(self):
        logger.info('Task queue cleared.')
        self.queue = []

