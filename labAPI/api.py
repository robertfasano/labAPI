from flask import Flask, request, render_template, Response
import json
from threading import Thread
from labAPI import path
import os, sys
import logging

logging.getLogger('werkzeug').setLevel(logging.ERROR)

class API:
    def __init__(self, environment, addr='127.0.0.1', port=8000, debug=False):
        self.addr = addr
        self.port = port
        self.environment = environment
        self.debug = debug

        cli = sys.modules['flask.cli']
        cli.show_server_banner = lambda *x: None

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
            return json.dumps(self.environment.snapshot(refresh=False))



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

        @app.route("/monitor/pause", methods=['GET', 'POST'])
        def pause():
            logging.warning('Pausing monitoring loop.')
            self.environment.monitor.pause()
            return json.dumps(self.environment.monitor.paused)

        @app.route("/monitor/resume", methods=['GET', 'POST'])
        def resume():
            logging.warning('Resuming monitoring loop.')
            self.environment.monitor.resume()
            return json.dumps(self.environment.monitor.paused)

        app.run(host=self.addr, port=self.port, debug=self.debug)