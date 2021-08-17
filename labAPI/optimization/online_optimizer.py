from labAPI.optimization.samplers import RandomSearch
from labAPI.optimization.models import GaussianProcess
from labAPI.optimization.optimizers import DifferentialEvolution
from functools import partial
from tqdm.auto import tqdm
import matplotlib.pyplot as plt
import numpy as np

class OnlineOptimizer:
    def __init__(self, cost, sampler=None, model=None, optimizer=None, samples=None):
        self.cost = cost

        self.sampler = sampler
        self.model = model
        self.optimizer = optimizer
        self.samples = samples 

        if self.sampler is None:
            self.sampler = RandomSearch

        self.sampler = self.sampler(self.cost)

        if self.model is None:
            self.model = GaussianProcess

        if self.optimizer is None:
            self.optimizer = DifferentialEvolution

    def add_parameter(self, parameter, bounds):
        self.sampler.add_parameter(parameter, bounds)
        
    def setup(self):
        dim = len(self.sampler.parameters)
        if self.samples is None:
            self.samples = 10*dim

        self.sampler.samples = self.samples
        self.sampler.run()
        
        self.model = self.model(dim=dim)
        self.model.fit(self.sampler.X, self.sampler.y)
        
    def refine(self, batches=10, N=10, leash=1):
        ''' Args:
                batches (int): total number of suggest-sample-fit cycles to run. The effective cost function
                               is ramped linearly from pure exploration to pure optimization over the set of batches.
                N (int): samples per batch, obtained by minimizing the response surface from random starting points
                         for a given exploration-optimization tradeoff.
                leash (float): limits the bounds of suggested points to within some fraction of the total 
                               search space around the best point. The leashing is originally off, and it ramps
                               linearly to the passed value over the set of batches.
                         '''
        b = np.linspace(0, 1, batches)
        leash = np.linspace(1, leash, batches)    # gradually tightening fraction of total search space

        n = 0
        for b0 in tqdm(b):
            opt = self.optimizer(partial(self.model.cost, b=b0))

            X0 = self.model.X[np.argmin(self.model.y)]            
            span = np.array([self.model.X[:,i].max() - self.model.X[:,i].min() for i in range(len(X0))])
            
            bounds = []
            for i in range(len(X0)):
                min_i = np.max([X0[i]-leash[n]*span[i]/2, self.model.X[:,i].min()])
                max_i = np.min([X0[i]+leash[n]*span[i]/2, self.model.X[:,i].max()])
                bounds.append([min_i, max_i])
                
            X = opt.suggest(X0, bounds, N=N)
            for x0 in X:
                self.sampler.measure(x0)

            self.model.fit(self.sampler.X, self.sampler.y)
            print(f'Completed batch {n}. Model score: {self.model.model.score(self.model.X, self.model.y)}.')
            n += 1
            
    def plot_model(self):
        self.model.plot()
        
    def best(self):
        ''' Returns a prediction of the best point '''
        opt = self.optimizer(partial(self.model.cost, b=1))
        X0 = self.model.X[np.argmin(self.model.y)]            
        bounds = [[self.model.X[:, i].min(), self.model.X[:, i].max()] for i in range(len(X0))]
        return opt.suggest(X0, bounds, N=1)[0]
    
    def plot_convergence(self):
        self.sampler.plot_history()
        
    def sensitivity(self):
        ''' Returns the length scales for the trained Gaussian process '''
        scales = self.model.model.kernel_.get_params()['k1__k2__length_scale']
        sens = {}
        for i, p in enumerate(self.sampler.parameters):
            sens[p] = scales[i]
        return sens
    
    def plot_1d(self, axis=None, X0=None):
        ''' Plots a 1D slice along an axis through a point X0 
            Args:
                axis (string): the parameter name. If None, plot along all axes.
                X0 (array): a coordinate
        '''
        if X0 is None:
            X0 = self.best()
            
        if axis is None:
            indices = range(len(self.sampler.parameters))
        else:
            for i, p in enumerate(self.sampler.parameters):
                if p == axis:
                    break
            indices = [i]
        
        fig, axes = plt.subplots(len(indices), 1, dpi=300)
        if not isinstance(axes, np.ndarray):
            axes = [axes]
        fig.tight_layout()
        
        for i, axis in enumerate(indices):
            self.model.plot_1d(axis, X0, ax=axes[i])
            axes[i].set_xlabel(list(self.sampler.parameters.keys())[axis])
            axes[i].set_ylabel(self.sampler.experiment.name)
            axes[i].set_ylim([self.sampler.y.min(), self.sampler.y.max()])

    def plot_2d(self, ax0, ax1, X0=None, levels=20):
        ''' Plots a 2D slice along a plane through a point X0 
            Args:
                ax0 (string): the parameter to plot on the x-axis
                ax1 (string): the parameter to plot on the y-axis
                X0 (array): a coordinate
        '''
        if X0 is None:
            X0 = self.best()

        ax0_index = None
        ax1_index = None
        for i, p in enumerate(self.sampler.parameters):
            if p == ax0:
                ax0_index = i
            elif p == ax1:
                ax1_index = i

        self.model.plot_2d(ax0_index, ax1_index, X0, levels=levels)
        plt.xlabel(ax0)
        plt.ylabel(ax1)