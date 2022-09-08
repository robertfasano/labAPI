

# LabAPI [![Build Status](https://app.travis-ci.com/robertfasano/labAPI.svg?branch=master)](https://app.travis-ci.com/github/robertfasano/labPI)
LabAPI is a Python library for abstraction of device control and networking for scientific experiments. By adding several lines of code to existing device drivers, experiments can be augmented with new features like a web interface for device control, monitoring and logging of the experimental state, and machine-learning optimization of experimental outcomes. 

# Installation
This installation guide assumes that you've installed the [standard Anaconda distribution](https://www.anaconda.com/products/individual]). If you're not using Anaconda, Argent can still be installed as a standard Python package without a virtual environment.

Create and activate a new virtual environment:

```
conda create -n labAPI python=3.9
conda activate labAPI
```

Install or update using pip:

```pip install git+https://github.com/robertfasano/labAPI```

Run the demo environment:

```
labAPI demo
```

You can interact with the demo environment by navigating to 127.0.0.1:9010 in a browser.

# Developing LabAPI
To develop LabAPI, clone the repository and install in development mode instead of installing with pip:
```
git clone https://github.com/robertfasano/labAPI
cd labAPI
pip install -e .
```
To develop the web interface, you'll need to install [npm](https://www.npmjs.com/). Then, install the required js packages:
```
cd labAPI/dashboard/static
npm install .
```
Finally, compile the web interface:
```
npm run watch
```
The ```watch``` script activates a developer mode where any changes to the code base trigger rapid recompilations. For a one-off build, you can instead call ```npm run build```.

