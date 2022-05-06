import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel
from scipy.optimize import minimize
from .model import Model
from warnings import simplefilter
from sklearn.exceptions import ConvergenceWarning
simplefilter("ignore", category=ConvergenceWarning)

class GaussianProcess(Model):
    def __init__(self, dim, amplitude=1, length_scale=1, noise=0.1, kernel=None):
        super().__init__()

        self.amplitude = amplitude
        self.length_scale = length_scale
        self.noise = noise

        self.X = []
        self.y = []

        self.kernel = kernel
        if self.kernel is None:
            self.kernel = C(self.amplitude, (1e-5, 1e3)) * RBF([self.length_scale]*dim, (1e-2, 1e3)) + WhiteKernel(self.noise, (1e-9, 1))
        self.model = GaussianProcessRegressor(kernel=self.kernel, n_restarts_optimizer=10)

    def fit(self, points, costs):
        self.X = points
        self.y = costs
        self.model.fit(self.X, self.y)

    def predict(self, X):
        return self.model.predict(np.atleast_2d(X), return_std = True)
    
    def cost(self, X, b=1):
        ''' b=0: maximize uncertainty; b=1: minimize mean'''
        mu, sigma = self.predict(X)
        return b*mu + (1-b)*sigma
        # return -np.sqrt(b**2*mu**2+(1-b**2)*sigma**2)

    def score(self):
        return self.model.score(self.X, self.y)
