import express from 'express';
import { endpoint } from '../core/endpoint';
import { isAuth, CustomError } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';
import prisma from '../database/client';

const router = express.Router();

router.get(
  '/',
  isAuth,
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const usersWithBirthdays = await prisma.$queryRaw`
      SELECT 
        concat("firstName", ' ', "lastName") as "Name",
        date_part('year', age(birthdate)) as "Age",
        date_part('year', birthdate)||'-'||date_part('month', birthdate)||'-'||date_part('day', birthdate) as "Birthdate",
        CASE
          WHEN 
            (DATE_PART('month', "birthdate") = DATE_PART('month', CURRENT_DATE)
            AND
            DATE_PART('day', "birthdate") = DATE_PART('day', CURRENT_DATE))
          THEN
            'Yes'
          ELSE 
            'No'
        END AS is_birthday_today
      FROM 
        "User" 
      WHERE 
        date(date_part('year', current_date)||'-'||date_part('month', birthdate)||'-'||date_part('day', birthdate)) BETWEEN current_date AND current_date + interval '7 days'
      Order by 
        "Birthdate" DESC
      LIMIT
        ${pageSize}
      OFFSET
        ${(pageNumber - 1) * pageSize}
    `;

    if (!usersWithBirthdays) {
      throw new CustomError('No birthdays found', 404);
    }

    const usersAnniversaries = await prisma.$queryRaw`
      SELECT
        concat("firstName", ' ', "lastName") as "Name",
        date_part('year', age(joined_klivvr)) as "Years",
        date_part('year', joined_klivvr)||'-'||date_part('month', joined_klivvr)||'-'||date_part('day', joined_klivvr) as "in_klivvr_since"
      FROM
        "User"
      WHERE
        date_part('month', joined_klivvr) = date_part('month', current_date)
        AND
        date_part('day', joined_klivvr) = date_part('day', current_date)
      Order by
        "in_klivvr_since" DESC
      LIMIT
        ${pageSize}
      OFFSET
        ${(pageNumber - 1) * pageSize}
    `;

    if (!usersAnniversaries) {
      throw new CustomError('No anniversaries found', 404);
    }

    res.status(200).json({ usersWithBirthdays, usersAnniversaries });
  }),
);

export default router;
