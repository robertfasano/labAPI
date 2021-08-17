import numpy as np
import attr
from .sampler import Sampler

import matplotlib.pyplot as plt
from scipy.interpolate import griddata

@attr.s
class GridSearch(Sampler):
    samples = attr.ib(default=100, converter=int)
    scans = attr.ib(default=1, converter=int)
    order = attr.ib(default='sweep')

    def generate_grid(self):
        dim = len(self.parameters)
        grid = []
        for name, parameter in self.parameters.items():
            if name in self.points:
                grid.append(self.points[name])
            else:
                grid.append(np.linspace(self.bounds[name][0], self.bounds[name][1], int(self.samples**(1/dim))))
        grid = np.transpose(np.meshgrid(*[grid[n] for n in range(dim)])).reshape(-1, dim)

        if self.order == 'random':
            np.random.shuffle(grid)
        
        return grid

    def run(self):
        points = self.generate_grid()
        for point in self.iterate(points):
            self.measure(point)

    def plot(self):
        if len(self.parameters.keys()) == 1:
            self.plot_1d()
        elif len(self.parameters.keys()) == 2:
            self.plot_2d()

    def plot_1d(self):
        x_name = list(self.parameters.keys())[0]
        y_name = self.experiment.name
        x = self.dataset[x_name].values
        y = self.dataset[y_name].values
        plt.figure(dpi=300)
        plt.plot(x, y, '.', color='#13476c')
        plt.xlabel(x_name)
        plt.ylabel(y_name)

    def plot_2d(self, levels=None, method='nearest'):
        x_name = list(self.parameters.keys())[0]
        y_name = list(self.parameters.keys())[1]
        z_name = self.experiment.name
        x = self.dataset[x_name].values
        y = self.dataset[y_name].values
        z = self.dataset[z_name].values

        nx = ny = 100
        xi = np.linspace(x.min(), x.max(), nx)
        yi = np.linspace(y.min(), y.max(), ny)

        X,Y = np.meshgrid(xi,yi)
        Z = griddata((x, y), z, (X, Y), method=method)
        plt.figure(dpi=300)
        plt.contourf(X,Y,Z, levels=levels)
        plt.colorbar(label=z_name)
        plt.xlabel(x_name)
        plt.ylabel(y_name)
        