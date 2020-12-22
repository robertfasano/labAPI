''' Command-line handler for LabAPI utilities such as testing or hosting an
    example Environment
'''
import click
import os

@click.command()
@click.argument('option', type=click.Choice(['build', 'demo', 'install', 'test', 'watch']))
@click.option('--verbose/--quiet', default=False)
def main(option, verbose):

    if option == 'demo':
        from labAPI.tests import test_example
        if verbose:
            print('LabAPI command-line utility: launching demo environment.')
        test_example.test_example(test=False, host=True)

    if option == 'test':
        if verbose:
            print('LabAPI command-line utility: running tests.')
        path = os.path.abspath(os.path.join(__file__, '../tests'))
        import pytest
        pytest.main(['-x', path])

    if option == 'build':
        if verbose:
            print('LabAPI command-line utility: building webapp.')
        path = os.path.abspath(os.path.join(__file__, '../dashboard/static'))
        os.chdir(path)
        cmd = 'npm run build'
        if not verbose:
            cmd += ' --quiet'
        os.system(cmd)

    if option == 'watch':
        if verbose:
            print('LabAPI command-line utility: building webapp in watch mode.')
        path = os.path.abspath(os.path.join(__file__, '../dashboard/static'))
        os.chdir(path)
        cmd = 'npm run watch'
        if not verbose:
            cmd += ' --quiet'
        os.system(cmd)

    if option == 'install':
        if verbose:
            print('LabAPI command-line utility: installing node_modules.')
        path = os.path.abspath(os.path.join(__file__, '../dashboard/static'))
        os.chdir(path)
        cmd = 'npm install .'
        if not verbose:
            cmd += ' --no-progress --silent'
        os.system(cmd)
