from threading import Thread
import functools

class TimeoutException(Exception):
    def __init__(self):            
        # Call the base class constructor with the parameters it needs
        super().__init__('Timeout exception')
        
def timeout(timeout):
    ## Adapted form acushner's example at https://stackoverflow.com/questions/21827874/
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = [TimeoutException()]
            def newFunc():
                result[0] = func(*args, **kwargs)
            t = Thread(target=newFunc)
            t.daemon = True
            t.start()
            t.join(timeout)

            if isinstance(result[0], BaseException):
                raise result[0]
            return result[0]
        return wrapper
    return deco