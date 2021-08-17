import numpy as np
from scipy.optimize import minimize
from .optimizer import Optimizer

class L_BFGS_B(Optimizer):
    def __init__(self, cost, tol=1e-2):
        ''' Args:
                cost (function): a callable which takes a single argument X and returns a single result
                tol (float): convergence tolerance
        '''
        def optimize(X0, bounds):
            res = minimize(fun=cost,
                        x0=X0,
                        bounds=bounds,
                        method='L-BFGS-B',
                        tol = tol)
            
            return res.x, res.fun

        super().__init__(optimize)