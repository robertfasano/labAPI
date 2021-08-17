from abc import abstractmethod
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import griddata

class Model:
    def __init__(self):
        super().__init__()
        self.X = []
        self.y = []

    @abstractmethod
    def predict(self, X):
        ''' Return a tuple of the mean and uncertainty (optional) of the response surface at the point X '''
        return

    @abstractmethod
    def fit(self, X, y):
        ''' Fit the response surface to a passed set of coordinates and costs '''
        return

    @abstractmethod
    def cost(self, X, **kwargs):
        ''' Returns an effective cost at a point X, which is generally a function of the mean and/or uncertainty '''
        return

    def plot_1d(self, axis, X0, ax=None):
        ''' Plots a slice along one axis passing through a point X0'''
        dim = self.X.shape[1]
        bounds = [[self.X[:, i].min(), self.X[:,i].max()] for i in range(dim)]
        N=100
        X = np.zeros(shape=(N, dim))
        for i in range(dim):
            X[:, i] = np.ones(N)*X0[i] 

        xi = np.linspace(*bounds[axis], N)
        X[:, axis] = xi

        mu, sigma = self.predict(X)

        if ax is None:
            plt.figure(dpi=300)
            ax = plt.gca()
        ax.plot(xi, mu, color='#1f77b4', label='Model')
        ax.fill_between(xi, mu-1.96*sigma, mu+1.96*sigma, color='#1f77b4', alpha=0.25, label='95% confidence region')

    def plot_2d(self, ax0, ax1, X0, levels=20):
        ''' Plots a slice along one axis passing through a point X0'''
        N = 100
        dim = self.X.shape[1]
        
        bounds = [[self.X[:, i].min(), self.X[:,i].max()] for i in range(dim)]
        xi = np.linspace(bounds[ax0][0], bounds[ax0][1], N)
        yi = np.linspace(bounds[ax1][0], bounds[ax1][1], N)
        grid = []
        grid.append(xi)
        grid.append(yi)

        grid = np.transpose(np.meshgrid(*[grid[n] for n in range(2)])).reshape(-1, 2)
            
        X = np.zeros(shape=(N**2, dim))
        for i in range(dim):
            X[:, i] = np.ones(N**2)*X0[i] 
        X[:, ax0] = grid[:, 0]
        X[:, ax1] = grid[:, 1]
        
        mu, sigma = self.predict(X)

        ordinate_mesh, abscissa_mesh = np.meshgrid(xi, yi)
        cost_grid = griddata(X[:,[ax0, ax1]], mu, (ordinate_mesh,abscissa_mesh))
        
        plt.figure(dpi=300)
        plt.contourf(ordinate_mesh, abscissa_mesh, cost_grid, cmap='viridis', levels=levels)
        plt.colorbar()
        plt.xlim(bounds[ax0])
        plt.ylim(bounds[ax1])

        ## plot crosshairs through best point
        plt.plot(xi, X0[ax1] * np.ones(N), 'k')
        plt.plot(X0[ax0] * np.ones(N), yi, 'k')
        plt.scatter(X0[ax0], X0[ax1], marker='o', c='k')