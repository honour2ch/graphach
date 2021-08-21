if [ ${ENV} = "development" ]
then
    pip3 install --upgrade pip -r requirements.txt
elif [ ${ENV} = "test" ]
    pip3 install --upgrade pip -r requirements.tests.txt
then
    npm install
fi