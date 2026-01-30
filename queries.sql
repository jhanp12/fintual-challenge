SELECT 
    movement_type,
    SUM(amount) as total_amount,
    COUNT(*) as total_transactions
FROM user_movements
WHERE DATE_TRUNC('month', date) = '2021-12-01'
GROUP BY movement_type;

SELECT 
    date,
    movement_type,
    COUNT(*) as cantidad,
    AVG(amount) as monto_promedio
FROM user_movements
GROUP BY date, movement_type
ORDER BY date DESC, movement_type;

SELECT 
    ud.name,
    ud.last_name,
    COUNT(*) as total_aportes,
    SUM(um.amount) as monto_total_aportado
FROM user_data ud
INNER JOIN user_movements um ON ud.user_id = um.user_id
WHERE um.movement_type = 'subscription'
GROUP BY ud.user_id, ud.name, ud.last_name
ORDER BY total_aportes DESC
LIMIT 1;


SELECT 
    ud.name,
    ud.last_name,
    COUNT(*) as total_aportes,
    SUM(um.amount) as monto_total_aportado
FROM user_data ud
INNER JOIN user_movements um ON ud.user_id = um.user_id
WHERE um.movement_type = 'subscription'
GROUP BY ud.user_id, ud.name, ud.last_name
ORDER BY monto_total_aportado DESC
LIMIT 1;

SELECT 
    'DICIEMBRE 2021' as periodo,
    SUM(CASE WHEN movement_type = 'subscription' THEN amount ELSE 0 END) as total_aportes,
    SUM(CASE WHEN movement_type = 'withdrawal' THEN amount ELSE 0 END) as total_retiros,
    COUNT(CASE WHEN movement_type = 'subscription' THEN 1 END) as cantidad_aportes,
    COUNT(CASE WHEN movement_type = 'withdrawal' THEN 1 END) as cantidad_retiros
FROM user_movements
WHERE date >= '2021-12-01' AND date < '2022-01-01';