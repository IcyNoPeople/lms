const fs = require('fs');
const express = require('express');

const Router = express.Router();
const {
    promisify,
} = require('util');


const mydatabase = require('./database');


const queryAsync = promisify(mydatabase.query).bind(mydatabase);

Router.get('/', async (req, res) => {

    if (req.session.loggedin && req.session.staff) {

        let staff_profile = 'select s.first_name, s.last_name, s.position, d.name from staff s, department d where s.department_id = d.department_id AND s.staff_id = ?;';
        let access_SQL = 'select acty.name from access_type acty where exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ?); ';
        let approveLoanSQL = 'select l.*, c.first_name, c.last_name , lt.name from loan l, loan_type lt, customer c where l.account_id = c.cus_id AND l.status = "new" AND lt.loan_type_id = l.loan_type_id AND exists (select acty.department_id from access_type acty where lt.department_id = acty.department_id AND acty.approval_limit >= l.loan_amount AND exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ? )) ORDER BY l.date_of_application; ';
        let pendingLoanSQL = 'select count(l.loan_id) AS pending from loan l, loan_type lt, customer c where l.account_id = c.cus_id AND l.status = "new" AND lt.loan_type_id = l.loan_type_id AND exists (select acty.department_id from access_type acty where lt.department_id = acty.department_id AND acty.approval_limit >= l.loan_amount AND exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ? ))';
        let currentLoanSQL = 'select count(lv.loan_id) AS ongoing from loan_view lv WHERE outstanding_amount > 0 AND status = "approved" AND EXISTS (SELECT * from access a, access_type acty WHERE lv.loanType_departmentID = acty.department_id AND a.accesstype_id = acty.access_id AND a.account_id = ?);';

        let approveLoan = {};
        let accessRes = {};
        let staffRes = {};

        try {
            accessRes = await queryAsync(access_SQL, [req.session.sta_id]);
            staffRes = await queryAsync(staff_profile, [req.session.sta_id]);
            approveLoan = await queryAsync(approveLoanSQL, [req.session.sta_id]);
            let pendingLoan = await queryAsync(pendingLoanSQL, [req.session.sta_id]);
            let currentLoan = await queryAsync(currentLoanSQL, [req.session.sta_id]);


            res.render('staffHome', {
                staffID: req.session.sta_id,
                staffRes: staffRes[0],
                accessRes: accessRes,
                approveLoan: approveLoan,
                pendingLoan: pendingLoan[0],
                currentLoan: currentLoan[0]

            });
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.send('Please login to view this page!');
    }


});

Router.get('/test/:id', async (req, res) => {

    if (req.session.loggedin && req.session.staff) {

        let staff_profile = 'select s.first_name, s.last_name, s.position, d.name from staff s, department d where s.department_id = d.department_id AND s.staff_id = ?;';
        let access_SQL = 'select acty.name from access_type acty where exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ?); ';
        let approveLoanSQL = 'select l.*, c.first_name, c.last_name , lt.name from loan l, loan_type lt, customer c where l.account_id = c.cus_id AND l.status = "new" AND lt.loan_type_id = l.loan_type_id AND exists (select acty.department_id from access_type acty where lt.department_id = acty.department_id AND acty.approval_limit >= l.loan_amount AND exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ? )) ORDER BY l.date_of_application; ';
        let pendingLoanSQL = 'select count(l.loan_id) AS pending from loan l, loan_type lt, customer c where l.account_id = c.cus_id AND l.status = "new" AND lt.loan_type_id = l.loan_type_id AND exists (select acty.department_id from access_type acty where lt.department_id = acty.department_id AND acty.approval_limit >= l.loan_amount AND exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ? ))';
        let currentLoanSQL = 'select count(lv.loan_id) AS ongoing from loan_view lv WHERE outstanding_amount > 0 AND status = "approved" AND EXISTS (SELECT * from access a, access_type acty WHERE lv.loanType_departmentID = acty.department_id AND a.accesstype_id = acty.access_id AND a.account_id = ?);';

        let approveLoan = {};
        let accessRes = {};
        let staffRes = {};

        try {
            accessRes = await queryAsync(access_SQL, [req.session.sta_id]);
            staffRes = await queryAsync(staff_profile, [req.session.sta_id]);
            approveLoan = await queryAsync(approveLoanSQL, [req.session.sta_id]);
            let pendingLoan = await queryAsync(pendingLoanSQL, [req.session.sta_id]);
            let currentLoan = await queryAsync(currentLoanSQL, [req.session.sta_id]);


            res.render('test', {
                staffID: req.session.sta_id,
                staffRes: staffRes[0],
                accessRes: accessRes,
                approveLoan: approveLoan,
                pendingLoan: pendingLoan[0],
                currentLoan: currentLoan[0]

            });
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.send('Please login to view this page!');
    }


});


Router.post('/update/:id', (req, res) => {
    if (req.session.loggedin && req.session.staff) {
        let loan_id = req.params.id;

        let updateApproveSQL = 'call approval_update(?,?)';
        mydatabase.query(updateApproveSQL, [loan_id, req.session.sta_id], (err, result) => {
            console.log('updated!')
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        })
    } else {
        res.send('Please login to view this page!');
    }

})

Router.get('/loan', async (req, res) => {
    if (req.session.loggedin && req.session.staff) {
        let query = 'Select * from lms.loan_view lv WHERE EXISTS (SELECT * from access a, access_type acty WHERE lv.loanType_departmentID = acty.department_id AND a.accesstype_id = acty.access_id AND a.account_id = ?)'
        let SQLresult = {}


        let approveLoanSQL = 'select l.*, c.first_name, c.last_name , lt.name from loan l, loan_type lt, customer c where l.account_id = c.cus_id AND l.status = "new" AND lt.loan_type_id = l.loan_type_id AND exists (select acty.department_id from access_type acty where lt.department_id = acty.department_id AND acty.approval_limit >= l.loan_amount AND exists (select * from access ac where ac.accesstype_id = acty.access_id AND ac.account_id = ? )) ORDER BY l.date_of_application; ';
        let approveLoan = {};
        try {
            SQLresult = await queryAsync(query, [req.session.sta_id]);
            approveLoan = await queryAsync(approveLoanSQL, [req.session.sta_id]);
            res.render('staffViewLoan', {

                exisitngLoan: SQLresult,
                approveLoan: approveLoan

            });

        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.send('Please login to view this page!');
    }
})

Router.get('/loan/:id', async (req, res) => {
    if (req.session.loggedin && req.session.staff) {
        let loan_id = req.params.id;
        let query = 'Select * from lms.loan_view lv WHERE loan_id = ?';
        let SQLresult = {}


        let paymentSQL = 'select * from payment, transaction_type where payment.transaction_id = transaction_type.transaction_type_id AND loan_id = ?';
        let payment = {};

        try {
            payment = await queryAsync(paymentSQL, [loan_id]);
            SQLresult = await queryAsync(query, [loan_id]);
            res.render('staffLoandetail', {

                exisitngLoan: SQLresult,
                payments: payment

            });
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }

    } else {
        res.send('Please login to view this page!');
    }
})





Router.get('/customerlist', async (req, res) => {
    if (req.session.loggedin && req.session.staff) {
        let query = 'select customer_id, customer_email, customer_salary, customer_firstName, customer_lastName, count(loan_id) AS total_loan, sum(lv1.outstanding_amount) AS total_outstanding from lms.loan_view lv1 where not exists (select distinct lv2.customer_id from lms.loan_view lv2 where lv2.customer_id = lv1.customer_id AND not exists (select distinct lv.customer_id from lms.loan_view lv where lv2.customer_id = lv.customer_id and exists (select * from loan_type lt, access_type acty WHERE lt.loan_type_id = lv.loan_type_id AND lt.department_id = acty.department_id AND exists (select * from access ac where ac.accesstype_id = acty.access_id and ac.account_id = ?)))) group by customer_id;';
        let SQLresult = {};

        try {
            SQLresult = await queryAsync(query, [req.session.sta_id]);

            res.render('staffCustomerlist', {

                existingCustomer: SQLresult

            });
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }

    } else {
        res.send('Please login to view this page!');
    }
})


module.exports = Router;