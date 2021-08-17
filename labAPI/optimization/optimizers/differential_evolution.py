import numpy as np
from .optimizer import Optimizer
from scipy.optimize import differential_evolution

class DifferentialEvolution(Optimizer):
    def __init__(self, cost, tol=1e-2, popsize=15):
        ''' Args:
                cost (function): a callable which takes a single argument X and returns a single result
                tol (float): convergence tolerance
                popsize (int): population size
        '''
        def optimize(X0, bounds):
            res = differential_evolution(cost, 
                                         bounds,
                                         popsize=popsize, 
                                         polish=False)

            return res.x, res.fun

        super().__init__(optimize)
