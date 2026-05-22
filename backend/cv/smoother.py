# smoother.py
from collections import deque
import numpy as np

class MovingAverageSmoother:
    def __init__(self, window_size=5):
        """
        Initializes the smoother with a specific window size.
        A larger window means more stability but slightly more delay.
        """
        self.window_size = window_size
        self.history = deque(maxlen=window_size)

    def smooth(self, new_value):
        """ Adds a new value to history and returns the average. """
        self.history.append(new_value)
        return np.mean(self.history)

    def reset(self):
        """ Clears the history. """
        self.history.clear()
