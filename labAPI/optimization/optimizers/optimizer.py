import numpy as np

class Optimizer:
    def __init__(self, optimize):
        ''' Args:
                optimize (callable): a function or partial which takes a starting coordinate X0 and returns a (X, y) pair

        '''
        self.optimize = optimize

    def suggest(self, X0, bounds, N=1):
        ''' L-BFGS-B algorithm from scipy.optimize. Returns a tuple of the suggested coordinates
            Args:
                X0 (array): initial point
                bounds (2D array): an array of [min, max] pairs for all independent variables
                N (int): total number of trajectories. The first trajectory will use the initial point x0, and all subsequent restarts
                will start at random points within the bounds. 
         '''
        X = []
        y = []

        for _ in range(N):
            if _ > 0:
                X0 = [np.random.uniform(bounds[i][0], bounds[i][1]) for i in range(len(X0))]
        
            x, fun = self.optimize(X0, bounds)
            X = np.append(X, np.atleast_2d(x))
            y = np.append(y, fun)
        
        return X.reshape(-1, len(X0))

    