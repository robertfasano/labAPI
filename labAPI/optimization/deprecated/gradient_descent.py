import numpy as np
import attr
from .algorithm import Algorithm

@attr.s
class GradientDescent(Algorithm):
    learning_rate = attr.ib(default=1e-3, converter=float)
    amplitude = attr.ib(default=1e-2, converter=float)
    location = attr.ib(default=[], converter=np.atleast_2d)
    threshold = attr.ib(default=1e-2, converter=float)
    iterations = attr.ib(default=100, converter=int)
    def sample_gradient(self):
        dim = self.location.shape[1]
        g = np.zeros(dim)

        for d in range(dim):
            step = np.zeros(dim)
            step[d] = self.amplitude

            p1 = self.location + step
            p2 = self.location - step
            c1 = self.measure(p1)
            c2 = self.measure(p2)

            g[d] = (c1-c2)/(2*step[d])

        return g

    def run(self):
        iterations = 0
        while True:
            if self.iterations != 0 and iterations >= self.iterations:
                return
            g = self.sample_gradient()
            self.location += self.learning_rate * g
            c = self.measure(self.location)
            
            if np.abs(c) < self.threshold:
                return

            iterations += 1

    

