#!/bin/bash
stdbuf -o0 redis6-benchmark $1 | tee -a logs/$2

