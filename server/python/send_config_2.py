import time
import random
import string
import os

import sys, getopt

def main(argv):
	recordId = argv[0]

	time.sleep(5)


	script_dir = os.path.dirname(__file__) 
	f = open(os.path.join(script_dir, '../logs/'+recordId+'.txt'), 'w')
	f.write('finished')
	f.close()

	f = open(os.path.join(script_dir, '../records/'+recordId+'.txt'), 'w')
	f.write("{'some':'data'}")
	f.close()

if __name__ == "__main__":
	main(sys.argv[1:])
