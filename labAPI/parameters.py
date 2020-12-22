''' The Parameter class here is defined as a drop-in replacement for integers
    or floats, offering some enhanced functionalities. Suppose we
    have a parameter x with value 3:
        x = Parameter('x', 3)
    Mathematical operations on this parameter will behave exactly as with floats:
        x + 1  # returns 4
        x * 2: returns 6
        x > 4: returns False
        x <= 4: returns True

    Custom side effects can be added by passing functions to the get_cmd
    and set_cmd arguments. For example, a custom set_cmd could be used to
    update a voltage in the lab to V when x.set(V) is called.

    The Parameter class also supports callbacks which fire when the value is
    changed. For example, this could be used to log each value change to a file.

    For controlling real experiments, generally the subclasses of Parameter should
    be used instead of the base class. These offer enhanced functionality for
    various applications:
        Knob: a readable/writable parameter with optional min/max thresholds
        Measurement: a read-only parameter with optional unit parsing
        Selector: a parameter limited to a discrete set of setpoints
        Switch: a parameter with only true/false setpoints
'''
import numpy as np

class Parameter:
    ''' The Parameter class serves as a drop-in replacement for numerical datatypes
        with optional side-effects when the value is read or changed. Suppose we
        have a parameter x with value 3:
        >>> x = Parameter('x', 3)

        Mathematical operations on this behavior will behave exactly as with floats;
        for example:
        >>> x + 1
        4
        >>> x * 2
        6
        >>> x > 4
        False
        >>> x += 1
        >>> x == 4
        True

        Side-effects are implemented through functions passed to the get_cmd or
        set_cmd arguments of the constructor. For example, we could keep track
        of the number of times the value has been read or written:
        >>> count = 0
        >>> def update_count(value):
                nonlocal count
                count += 1
        >>> y = Parameter('y', 2, get_cmd=update_count, set_cmd = update_count)
        >>> count
        0

    '''
    def __init__(self, name, value=None, get_cmd=None, set_cmd=None):

        self.name = name
        self.get_cmd = get_cmd
        self.set_cmd = set_cmd

        self.callbacks = {}
        self.enable_callbacks = True

        self.value = None

        if value is not None:
            self.set(value)

    def __repr__(self):
        return "Parameter('{}', {})".format(self.name, self.get())

    def update_callbacks(self, value):
        if self.enable_callbacks:
            for callback in self.callbacks.values():
                callback(value)

    def get(self):
        ''' Updates the value with the result of self.get_cmd, if defined,
            then returns the value.
        '''
        if self.get_cmd is not None:
            self.value = self.get_cmd()
        self.update_callbacks(self.value)
        return self.value

    def set(self, value):
        ''' Updates self.value with the passed value, then sends the correction
            to the set_cmd and any defined callbacks.
        '''
        self.value = value
        if self.set_cmd is not None:
            self.set_cmd(value)
        self.update_callbacks(value)

    @property
    def __name__(self):
        return self.name

    def __neg__(self):
        return -self.get()

    def __mul__(self, n):
        return n*self.get()

    __rmul__ = __mul__

    def __pow__(self, n):
        return self.get()**n

    def __rpow__(self, n):
        return n**self.get()

    def __add__(self, a):
        return self.get() + a

    __radd__ = __add__

    def __sub__(self, a):
        return self.get() - a

    def __rsub__(self, a):
        return -self.__sub__(a)

    def __truediv__(self, a):
        return self.get() / a

    def __rtruediv__(self, a):
        return a / self.get()

    def __lt__(self, a):
        return self.get() < a

    def __le__(self, a):
        return self.get() <= a

    def __gt__(self, a):
        return self.get() > a

    def __ge__(self, a):
        return self.get() >= a

    def __eq__(self, a):
        return self.get() == a

    def __iadd__(self, a):
        self.set(self.value+a)
        return self

    def __isub__(self, a):
        self.set(self.value-a)
        return self

    def __imult__(self, a):
        self.set(self.value*a)
        return self

    def __idiv__(self, a):
        self.set(self.value/a)
        return self


''' Subclasses '''
class Knob(Parameter):
    def __init__(self, name, value=None, get_cmd=None, set_cmd=None, bounds=[-np.inf, np.inf]):
        self.bounds = list(bounds)
        super().__init__(name, value=value, get_cmd=get_cmd, set_cmd=set_cmd)

    def set(self, value):
        value = float(value)
        if not self.bounds[0] <= value <= self.bounds[1]:
            raise ValueError('Setpoint outside of defined bounds.')
        super().set(value)

    def snapshot(self, deep=False):
        if deep:
            return {'value': self.value, 'min': self.bounds[0], 'max': self.bounds[1], 'type': 'knob'}
        return self.value

class Measurement(Parameter):
    def __init__(self, name, get_cmd, default_unit='_'):
        super().__init__(name=name, get_cmd=get_cmd)
        self.unit_converters = {}
        self.default_unit = default_unit

    def set(self, value):
        raise ValueError('Measurements are read-only.')

    def get(self, unit=None):
        self.value = super().get()
        if unit is None:
            return self.value
        return self.unit_converters[unit](self.value)

    def add_unit(self, unit, converter):
        self.unit_converters[unit] = converter

    def __repr__(self):
        str = "Parameter('{}', {}".format(self.name, self.get())
        for unit in self.unit_converters:
            str += ", '{} {}'".format(self.get(unit=unit), unit)
        str += ')'
        return str

    def snapshot(self, deep=False):
        value = {self.default_unit: self.value}
        for unit, convert in self.unit_converters.items():
            value[unit] = convert(value[self.default_unit])
        if deep:
            return {'value': value, 'type': 'measurement', 'unit': self.default_unit}
        return value

class Selector(Parameter):
    def __init__(self, name, value, options, get_cmd=None, set_cmd=None):
        self.options = options
        super().__init__(name=name, value=value, get_cmd=get_cmd, set_cmd=set_cmd)

    def set(self, value):
        if not value in self.options:
            raise ValueError(f'Value should be one of {self.options}.')
        super().set(value)

    def snapshot(self, deep=False):
        if deep:
            return {'value': self.value, 'options': self.options, 'type': 'selector'}
        return self.value

class Switch(Selector):
    def __init__(self, name, value, get_cmd=None, set_cmd=None):
        super().__init__(name, value, [True, False], get_cmd=get_cmd, set_cmd=set_cmd)

    def snapshot(self, deep=False):
        if deep:
            return {'value': self.value, 'type': 'switch'}
        return self.value
