import numpy as np
import attr
from .algorithm import Algorithm

import matplotlib.pyplot as plt
from scipy.interpolate import griddata

@attr.s
class GridSearch(Algorithm):
    steps = attr.ib(default=20, converter=int)
    scans = attr.ib(default=1, converter=int)
    refinements = attr.ib(default=0, converter=int)
    order = attr.ib(default='sweep')

    def generate_grid(self):
        dim = len(self.parameters)
        grid = []
        for name, parameter in self.parameters.items():
            if name in self.points:
                grid.append(self.points[name])
            else:
                grid.append(np.linspace(self.bounds[name][0], self.bounds[name][1], self.steps))
        grid = np.transpose(np.meshgrid(*[grid[n] for n in range(dim)])).reshape(-1, dim)

        if self.order == 'random':
            np.random.shuffle(grid)
        
        return grid

    def run(self):
        points = self.generate_grid()
        for point in self.iterate(points):
            self.measure(point)

        for i in range(self.refinements):
            self.zoom()
            points = self.generate_grid()
            for point in self.iterate(points):
                self.measure(point)


    def zoom(self, fraction=0.5):
        ''' Repeat the grid search on a smaller fraction of the initial search space, centered on the best guess at the minimum '''
        for key in self.bounds:
            center = self.dataset[key][self.dataset[self.experiment.name].idxmin()]
            span = (self.bounds[key][1] - self.bounds[key][0]) * fraction
            self.bounds[key] = [center - span/2, center + span/2]

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
        plt.plot(x, y)
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

        plt.contourf(X,Y,Z, levels=levels)
        plt.colorbar(label=z_name)
        plt.xlabel(x_name)
        plt.ylabel(y_name)
        