import numpy as np
import attr
from .sampler import Sampler

import numpy as np
import attr
from .sampler import Sampler

@attr.s
class RandomSearch(Sampler):
    samples = attr.ib(default=100, converter=int)

    def run(self):
        bounds = np.array([b for b in self.bounds.values()])
        points = np.random.uniform(bounds[:, 0], bounds[:, 1], size=(self.samples, len(bounds)))
        for point in self.iterate(points):
            self.measure(point)
