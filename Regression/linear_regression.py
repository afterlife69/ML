#linear regression
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
#load the data set
data = pd.read_csv(r"C:\Users\akell\Downloads\Salary_Data.csv")

#split the data set into independent and dependent variables
x = data.iloc[:, :-1].values
y = data.iloc[:, 1].values

#split the data set into training and test set
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=1/3, random_state=0)  

#fit the model
regressor = LinearRegression()
regressor.fit(x_train, y_train)

#predict the test set
y_pred = regressor.predict(x_test)

#visualize the training set
plt.scatter(x_train, y_train, color='red')
plt.plot(x_train, regressor.predict(x_train), color='blue')
plt.title('Salary vs Experience (Training set)')
plt.xlabel('Years of Experience')
plt.ylabel('Salary')
plt.show()

#visualize the test set
plt.scatter(x_test, y_test, color='red')
plt.plot(x_train, regressor.predict(x_train), color='blue')
plt.title('Salary vs Experience (Test set)')
plt.xlabel('Years of Experience')
plt.ylabel('Salary')
plt.show()

#predict the salary for 12 years of experience

print(regressor.predict([[12]]))