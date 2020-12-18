''' Command-line handler for LabAPI utilities such as testing or hosting an
    example Environment
'''
import click
import os

@click.command()
@click.argument('option', type=click.Choice(['example', 'test']))
def main(option):
    if option == 'example':
        from labAPI.tests import test_example
        print('LabAPI command-line utility: launching example environment.')
        test_example.test_example(test=False, host=True)

    if option == 'test':
        print('LabAPI command-line utility: running tests.')
        path = os.path.abspath(os.path.join(__file__, '../tests'))
        print(path)
        import pytest
        pytest.main(['-x', path])
