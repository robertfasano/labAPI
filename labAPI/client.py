import requests
from labAPI import Parameter

class RemoteParameter(Parameter):
    def __init__(self, addr, path):
        self.addr = addr
        self.path = path
        super().__init__(path, get_cmd=self._get, set_cmd=self._set)

    def _get(self):
        return requests.get(f'http://{self.addr}/parameters/{self.path}').json()

    def _set(self, value):
        requests.post(f'http://{self.addr}/parameters/{self.path}', json={'value': value})
        
class Client:
    def __init__(self, addr):
        self.addr = addr

    def set(self, addr, value):
        requests.post(f'http://{self.addr}/parameters/{addr}', json={'value': value})

    def get(self, addr):
        return requests.get(f'http://{self.addr}/parameters/{addr}').json()

    def snapshot(self):
        return requests.get(f'http://{self.addr}/parameters').json()

    def parameter(self, path):
        return RemoteParameter(self.addr, path)