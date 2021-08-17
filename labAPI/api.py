from flask import Flask, request, render_template
import requests
import json
from threading import Thread
from labAPI import Parameter, path
import os, sys
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


class RemoteEnvironment:
    def __init__(self, addr):
        self.addr = addr

    def set(self, addr, value):
        requests.post(f'http://{self.addr}/parameters/{addr}', json={'value': value})

    def get(self, addr):
        return requests.get(f'http://{self.addr}/parameters/{addr}').json()

    def freeze(self):
        return requests.get(f'http://{self.addr}').json()

    def sync(self):
        return requests.get(f'http://{self.addr}/sync').json()


class RemoteParameter(Parameter):
    def __init__(self, addr):
        self.addr = addr
        super().__init__(addr.split('/')[-1])

    def get(self):
        return requests.get(f'http://{self.addr}').json()

    def set(self, value):
        requests.post(f'http://{self.addr}', json={'value': value})

class API:
    def __init__(self, environment, addr='127.0.0.1', port=8000, debug=False):
        self.addr = addr
        self.port = port
        self.environment = environment
        self.debug = debug

        cli = sys.modules['flask.cli']
        cli.show_server_banner = lambda *x: None


    def get(self, endpoint):
        if endpoint[0] == '/':
            endpoint = endpoint[1:]
        text = requests.get(f'http://{self.addr}:{self.port}/{endpoint}').text
        try:
            text = json.loads(text)
        except json.JSONDecodeError:
            pass
        return text

    def post(self, endpoint, payload):
        ''' POST a json-compatible payload to an endpoint '''
        if endpoint[0] == '/':
            endpoint = endpoint[1:]
        response = requests.post(f'http://{self.addr}:{self.port}/{endpoint}', json=payload)
        return json.loads(response.text)

    def run(self):
        if self.debug:
            self.serve()
        else:
            self.thread = Thread(target=self.serve)
            self.thread.start()

    def serve(self):
        app = Flask(__name__,
                    template_folder=os.path.join(path, 'dashboard/templates'),
                    static_folder=os.path.join(path, 'dashboard/static'))

        @app.route("/")
        def main():
            return render_template('index.html', state=json.dumps(self.environment.snapshot(deep=True)))

        
        @app.route("/functions/<path:addr>", methods=['GET'])
        def function(addr):
            if '/' not in addr:
                addr = 'uncategorized/' + addr
            parameter = self.environment.parameters[addr]
            return json.dumps(parameter())

        @app.route("/parameters", methods=['GET', 'POST'])
        def parameters():
            if request.method == 'POST':
                state = json.loads(request.json['state'])
                print(state)
                for addr in state:
                    parameter = self.environment.parameters[addr]
                    try:
                        parameter.set(state[addr])
                    except ValueError:
                        continue
            return json.dumps(self.environment.snapshot())

        @app.route("/snapshots")
        def snapshots():
            return self.environment.snapshots.to_json(orient='index')

        @app.route("/sync")
        def sync():
            return json.dumps(self.environment.sync())

        @app.route("/parameters/<path:addr>", methods=['GET', 'POST'])
        def parameter(addr):
            if '/' not in addr:
                addr = 'uncategorized/' + addr
            parameter = self.environment.parameters[addr]
            if request.method == 'POST':
                parameter.set(request.json['value'])
                return ''
            elif request.method == 'GET':
                return json.dumps(parameter.get())

        app.run(host=self.addr, port=self.port, debug=self.debug)
