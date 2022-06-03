from flask import Flask, request, render_template, Response
from flask_socketio import SocketIO
import json
from threading import Thread
from labAPI import path, TaskManager
import os, sys
import logging
logger = logging.getLogger('labAPI')
from uuid import uuid1

logging.getLogger('werkzeug').setLevel(logging.ERROR)
logging.getLogger('werkzeug').disabled = True
logging.getLogger('socketio').setLevel(logging.ERROR)
logging.getLogger('engineio').setLevel(logging.ERROR)
logging.getLogger('geventwebsocket.handler').setLevel(logging.ERROR)

class API:
    def __init__(self, environment, addr='127.0.0.1', port=8000, debug=False):
        self.addr = addr
        self.port = port
        self.environment = environment
        self.debug = debug

        cli = sys.modules['flask.cli']
        cli.show_server_banner = lambda *x: None

        self.task_manager = TaskManager(self.environment)

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
        app.logger.disabled = True
        socketio = SocketIO(app)

        class SocketIOHandler(logging.Handler):
            def emit(self, record):
                self.format(record)
                socketio.emit('console', f'{record.asctime} {record.levelname} {record.msg}')
        handler = SocketIOHandler()
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        def emit_snapshot(snapshot):
            socketio.emit('snapshot', snapshot)

        self.environment.callbacks['client'] = emit_snapshot


        @app.route("/")
        def main():
            return render_template('index.html', state=json.dumps(self.environment.snapshot(refresh=False, deep=True)))

        @app.route("/functions/<path:addr>", methods=['GET'])
        def function(addr):
            self.task_manager.add(addr)
            return json.dumps(True)

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

        @app.route("/sync", methods=['GET'])
        def sync():
            return json.dumps(self.environment.snapshot(refresh=True, fire_callbacks=True))

        @app.route("/ping")
        def ping():
            return json.dumps(True)

        @app.route("/clear_tasks")
        def clear_tasks():
            self.task_manager.clear()

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
            logger.warning('Pausing monitoring loop.')
            self.environment.monitor.pause()
            return json.dumps(self.environment.monitor.paused)

        @app.route("/monitor/resume", methods=['GET', 'POST'])
        def resume():
            logger.warning('Resuming monitoring loop.')
            self.environment.monitor.resume()
            return json.dumps(self.environment.monitor.paused)

        # app.run(host=self.addr, port=self.port, debug=self.debug)
        socketio.run(app, host=self.addr, port=int(self.port), debug=self.debug)