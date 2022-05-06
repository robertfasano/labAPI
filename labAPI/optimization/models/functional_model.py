import numpy as np
from .model import Model
from scipy.optimize import curve_fit


class FunctionalModel(Model):
    ''' An interface for fitting an arbitrary model to experimental data for use in online optimization. '''
    def __init__(self, model):
        ''' Arguments:
                model (function): a regular function with the call signature foo(x, *params), where x is the independent
                                  variable and *params is one or more fit parameters.
        '''
        super().__init__()
        self.model = model

        self.X = None
        self.y = None
        self.coeffs = None

    def fit(self, points, costs):
        self.X = points
        self.y = costs
        self.coeffs, _ = curve_fit(self.model, points, costs)

    def predict(self, X):
        return self.model(X, *self.coeffs), 0
    
    def cost(self, X, b=1):
        ''' b=0: maximize uncertainty; b=1: minimize mean'''
        return self.predict(X)[0]

    def __call__(self, dim):
        self.dim = dim
        return self

    def score(self):
        residuals = self.y - self.predict(self.X)[0]
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((self.y-np.mean(self.y))**2)
        r_squared = 1 - ss_res / ss_tot
        return r_squared
