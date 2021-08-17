import numpy as np
import attr
from .sampler import Sampler
from scipy.optimize import differential_evolution

@attr.s
class DifferentialEvolution(Sampler):
    samples = attr.ib(default=100, converter=int)
    popsize = attr.ib(default=15, converter=int)

    def run(self):
        bounds = [b for b in self.bounds.values()]
        dim = len(bounds)
        maxiter = max(1, int(self.samples/self.popsize/dim-1))
        differential_evolution(lambda X: -self.measure(X), bounds, maxiter=maxiter, popsize=self.popsize, polish=False)
        print(f'Differential evolution complete after {maxiter} iterations and {len(self.y)} trials.')
        