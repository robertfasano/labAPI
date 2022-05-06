import numpy as np
import pandas as pd
import attr
from tqdm.auto import tqdm
from threading import Thread
from labAPI import Parameter 
import matplotlib.pyplot as plt 

@attr.s
class Sampler:
    ''' A base class for parameter space exploration and optimization.

        Arguments:
            experiment (callable): a function or method which measures the
                                   objective function at the current point in
                                   the parameter space. Takes no positional arguments.
                                   An instance of the labAPI.Parameter class can also
                                   be passed.
            parameters (dict): instances of the Parameter class to use
                               during optimization. Defaults to empty, and Parameters
                               can be added by calling Algorithm.add_parameter().
            bounds (dict): tuple bounds indexed by Parameter names. Defaults to empty,
                           and is set when adding Parameters.
            points (dict): optional points for each Parameter to override default
                           point generation in optimizers, e.g. sampling locations
                           for a grid search or initial population in a genetic algorithm.
            sign (int): choose between maximization (+1) and minimization (-1)
            X (2d array): coordinates sampled during optimization. Defaults to empty,
                          but previous results can be passed (along with results into
                          the y argument) to speed up some optimizers.
            y (1d array): objective function evaluations. Defaults to empty.
            threaded (bool): if True, run optimization in a separate thread.
            show_progress (bool): whether to display a progress bar during
                                  optimization. Adds <1 ms overhead per iteration.
            record_data (bool): whether to store X, y observations. Adds <1 ms overhead per iteration.
            display (bool): whether to display optimization status using ipywidgets.
                            Only works when running in a Jupyter environment.
            continuous (bool): whether to quit after convergence/specified number of iterations
                               or continue running.
    '''
    experiment = attr.ib(default=None)
    parameters = attr.ib(factory=dict)
    bounds = attr.ib(factory=dict)
    points = attr.ib(factory=dict)        # optional overrides to search points
    sign = attr.ib(default=1, converter=np.sign)
    X = attr.ib(factory=lambda: np.atleast_2d([]))
    y = attr.ib(factory=lambda: np.array([]))

    threaded = attr.ib(default=False)
    show_progress = attr.ib(default=True)
    continuous = attr.ib(default=False)

    def add_parameter(self, parameter, bounds):
        ''' Adds a parameter.

            Arguments:
                parameter (parametric.Parameter)
                bounds (tuple): a (min, max) pair defining the limits of the
                                optimization.
                points (array-like): a list of points to override sampling behavior
                                     in the algorithm.
        '''
        self.parameters[parameter.name] = parameter
        self.bounds[parameter.name] = bounds

        return self

    def best(self):
        ''' Returns the coordinates of the objective function minimum as determined by the algorithm '''
        return self.X[np.argmin(self.y)]

    def check_bounds(self, point):
        ''' Checks that the point is within the specified bounds '''
        i = 0
        for name, parameter in self.parameters.items():
            bounds = self.bounds[name]
            if not bounds[0] <= point[i] <= bounds[1]:
                raise ValueError(f'The optimizer requested a point outside the valid bounds for parameter {parameter.name} and will now terminate.')
            i += 1

    def actuate(self, point):
        ''' Actuate to specified point '''
        self.check_bounds(point)

        for i, (name, parameter) in enumerate(self.parameters.items()):
            parameter.set(point[i])

    def measure(self, point):
        ''' Actuate to specified point and measure result '''
        if self.experiment is None:
            raise ValueError('No experiment has been assigned to this optimizer!')

        self.actuate(point)

        if isinstance(self.experiment, Parameter):
            result = self.experiment.get()
        else:
            result = self.experiment()
     
        if len(self.X[0]) == 0:
            self.X = np.atleast_2d(point)
        else:
            self.X = np.append(self.X, np.atleast_2d(point), axis=0)
        self.y = np.append(self.y, result)


        return self.sign*result

    @property
    def dataset(self):
        ''' If the optimizer is set to data_format = 'numpy', this converts acquired
            data into a pandas.DataFrame.
        '''
        df = pd.DataFrame(self.X, columns = list(self.parameters.keys()))
        df[self.experiment.__name__] = self.y
        return df

    def iterate(self, lst):
        ''' Functions similarly to the built-in list() generator, e.g.
                for x in [1, 2, 3]:
                    print(x)
            prints 1, 2, and 3. 

            If self.show_progress==True, returns a tqdm generator for displaying
            a progress bar.
        '''
        if self.show_progress:
            yield from tqdm(lst)
        else:
            yield from list(lst)

    def run(self):
        if self.threaded:
            Thread(target=self._run).start()
        else:
            self._run()

    def plot(self, x):
        ''' A 1D plot of the objective function vs. an independent variable '''
        data = self.dataset.sort_values(x)
        plt.plot(data[x], data[self.experiment.name])
        plt.xlabel(x)
        plt.ylabel(self.experiment.name)

    def plot_history(self):
        ''' A 1D plot of the objective function vs. the iteration number '''
        plt.figure(dpi=300)
        plt.plot(self.y, '.')
        plt.xlabel('Iteration')
        plt.ylabel(self.experiment.name)
        plt.plot(np.minimum.accumulate(self.y), '-', color='#13476c')