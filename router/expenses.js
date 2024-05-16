import express from 'express';
import { Expense } from "../models/expenses.js";
import { Contract } from '../models/contracts.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ExpenseReports');
  },
  filename: function (req, file, cb) {
    // Generate a random unique identifier
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Append the unique identifier to the original filename
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

router.use('/uploads', express.static('uploads'));

const uploadReceipt = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
      return cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
    cb(null, true);
  }
});

// Middleware to parse JSON bodies
router.use(express.json());

// Route to add a new expense

router.post('/addExpense', uploadReceipt.single('receiptFile'), async (req, res) => {
  try {
    const {
      contractId,
      updatedResources,
      progressReport,
      date,
    } = req.body;

    // Parse the string into an array
    const parsedResources = JSON.parse(updatedResources);

    // Get the previous expenses for this contract
    const previousExpenses = await Expense.find({ contractId });

    // Calculate total expenses for each resource including previous expenses
    const totalExpenses = {};
    previousExpenses.forEach(expense => {
      expense.updatedResources.forEach(resource => {
        if (!totalExpenses[resource.name]) {
          totalExpenses[resource.name] = 0;
        }
        totalExpenses[resource.name] += parseFloat(resource.amount);
      });
    });

    // Add current expenses to total expenses
    parsedResources.forEach(resource => {
      if (!totalExpenses[resource.name]) {
        totalExpenses[resource.name] = 0;
      }
      totalExpenses[resource.name] += parseFloat(resource.amount);
    });

    // Get the contract
    const contract = await Contract.findById(contractId);

    // Calculate total remaining balance of the project
    const totalExpensesAmount = Object.values(totalExpenses).reduce((acc, curr) => acc + curr, 0);
    const remainingProjectBudget = contract.proposedBudget - totalExpensesAmount;
    console.log(remainingProjectBudget);

    // Create a new expense document
    const newExpense = new Expense({
      contractId,
      updatedResources: parsedResources,
      progressReport,
      date,
      receiptFile: req.file ? req.file.path : null,
      // Store remainingProjectBudget in the expense document
      remainingProjectBudget: remainingProjectBudget
    });

    // Calculate remaining amount for each resource
    const updatedResourcesWithRemaining = parsedResources.map(resource => {
      const resourceName = resource.name;
      const resourceAmount = parseFloat(resource.amount);
      const tenderEstimateItem = contract.tenderEstimate.find(item => item.name === resourceName);

      if (tenderEstimateItem) {
        const tenderEstimateAmount = parseFloat(tenderEstimateItem.amount);
        const remainingAmount = tenderEstimateAmount - (totalExpenses[resourceName] || 0);

        // Check if remaining amount is negative
        if (remainingAmount < 0) {
          throw new Error(`Expense for resource '${resourceName}' exceeds available budget.`);
        }

        resource.remainingAmount = remainingAmount;
        tenderEstimateItem.amount = remainingAmount.toString();
      } else {
        console.error(`Resource not found in tender estimate: ${resourceName}`);
      }

      return resource;
    });

    // Save the contract
    await contract.save();

    // Move the remaining amount for each resource to the updated resources array
    newExpense.updatedResources = updatedResourcesWithRemaining;

    // Save the expense document to the database
    const savedExpense = await newExpense.save();

    res.status(201).json({ savedExpense, remainingProjectBudget });
  } catch (error) {
    res.status(400).json({ error, message: error.message });
  }
});

//get expenses


router.get('/getExpenses/:id', async (req, res) => {
  const { id } = req.params;
  const expenses = await Expense.find({ contractId: id }).sort({ date: -1 });
  const latestExpense = expenses[0];
  
  let expensePerResource = {};
  let resourceDetails = {};

  expenses.forEach(element => {
    element.updatedResources.forEach(resource => {
      if (!resourceDetails.hasOwnProperty(resource.name)) {
        resourceDetails[resource.name] = [];
      }
      resourceDetails[resource.name].push({
        date: element.date,
        name: resource.name,
        amount: resource.amount,
        units: parseFloat(resource.quantity),
        remainingAmount: resource.remainingAmount
      });

      if (expensePerResource.hasOwnProperty(resource.name)) {
        expensePerResource[resource.name].amount += resource.amount;
        expensePerResource[resource.name].units += parseFloat(resource.quantity);
      } else {
        expensePerResource[resource.name] = {
          name: resource.name,
          amount: resource.amount,
          units: parseFloat(resource.quantity),
          remainingAmount: resource.remainingAmount
        };
      }
    });
  });

  const expenseArray = Object.keys(expensePerResource).map(name => ({
    name,
    ...expensePerResource[name]
  }));

  const remainingProjectBudget = latestExpense.remainingProjectBudget;

  res.status(201).json({ expenseArray, remainingProjectBudget, resourceDetails });
});


export default router;
