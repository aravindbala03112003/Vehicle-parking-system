-- Consolidated & Idempotent Production Schema for Park My Spot
-- Reconciles login_register and vehicle-parking-db into a unified, secure database.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample user (password is hash of demo credentials)
INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `password`) VALUES
(1, 'Aktar', 'aktar@gmail.com', '$2y$10$Jmf9Xk2y8m.fo3c/ZgKmzOrdIRkU05KSGLI0picKLEtr68ll7hjB.');

-- --------------------------------------------------------
-- Table structure for table `admin`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `AdminName` varchar(120) DEFAULT NULL,
  `UserName` varchar(120) DEFAULT NULL,
  `MobileNumber` bigint(10) DEFAULT NULL,
  `Security_Code` int(55) NOT NULL,
  `Email` varchar(200) DEFAULT NULL,
  `Password` varchar(120) DEFAULT NULL,
  `AdminRegdate` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `admin` (`ID`, `AdminName`, `UserName`, `MobileNumber`, `Security_Code`, `Email`, `Password`, `AdminRegdate`) VALUES
(1, 'Administrator', 'admin', 7854445410, 1100, 'admin@gmail.com', 'd00f5d5217896fb7fd601412cb890830', '2021-01-05 05:38:23'),
(2, 'varun', 'varun', 923456781, 2003, 'varun11112003@gmail.com', '61e193d05c35ed61a079f53391f57f9e', '2024-04-24 15:38:04'),
(3, 'ashik', 'ashik', 9876543344, 2003, 'ashikdoss@gmail.com', 'ashik2003', '2024-04-25 16:07:36'),
(4, 'james', 'james', 9876547643, 2003, 'james123@gmail.com', 'james', '2024-04-26 14:00:13'),
(5, 'oviyan', 'oviyan', 987567890, 2003, 'oviyan11112@2003', 'oviyan', '2024-05-02 14:01:51');

-- --------------------------------------------------------
-- Table structure for table `contactus`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contactus` (
  `Id` int(100) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `message` varchar(300) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `contactus` (`Id`, `name`, `email`, `message`) VALUES
(1, 'varun', 'varun2003@gmail.com', 'good morning'),
(2, 'bala', 'varun2003@gmail.com', 'website is good'),
(3, 'luffy', 'luffy124@gmail.com', 'good website');

-- --------------------------------------------------------
-- Table structure for table `feedbacktable`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedbacktable` (
  `Id` int(100) NOT NULL AUTO_INCREMENT,
  `rating` varchar(100) NOT NULL,
  `opinion` varchar(400) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `feedbacktable` (`Id`, `rating`, `opinion`) VALUES
(1, '5', 'good websit'),
(2, '5', 'this website is good'),
(3, '5', 'good website'),
(4, '5', 'good');

-- --------------------------------------------------------
-- Table structure for table `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `c_name` varchar(255) NOT NULL,
  `c_email` varchar(55) NOT NULL,
  `c_website` varchar(55) NOT NULL,
  `c_address` varchar(255) NOT NULL,
  `last_update` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`id`, `c_name`, `c_email`, `c_website`, `c_address`, `last_update`) VALUES
(1, 'Demo Company', 'vparksystem@company.com', 'codeastro.com', '8169 Geigeer St NW', '2021-06-08 20:48:52');

-- --------------------------------------------------------
-- Table structure for table `vcategory`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vcategory` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `VehicleCat` varchar(120) DEFAULT NULL,
  `shortDescription` varchar(50) NOT NULL,
  `CreationDate` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `vcategory` (`ID`, `VehicleCat`, `shortDescription`, `CreationDate`) VALUES
(1, 'Four Wheeler', 'Demo 4W', '2019-07-05 11:06:50'),
(2, 'Two Wheeler', 'Demo 2W', '2019-07-05 11:07:09'),
(6, 'Three Wheeler', 'MTCL 2W', '2021-03-07 16:41:57');

-- --------------------------------------------------------
-- Table structure for table `vehicle_info`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicle_info` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `ParkingNumber` varchar(120) DEFAULT NULL,
  `VehicleCategory` varchar(120) NOT NULL,
  `VehicleCompanyname` varchar(120) DEFAULT NULL,
  `RegistrationNumber` varchar(120) DEFAULT NULL,
  `OwnerName` varchar(120) DEFAULT NULL,
  `OwnerContactNumber` bigint(10) DEFAULT NULL,
  `InTime` timestamp NULL DEFAULT current_timestamp(),
  `OutTime` timestamp NULL DEFAULT NULL,
  `ParkingCharge` varchar(120) NOT NULL DEFAULT '0',
  `Remark` mediumtext DEFAULT NULL,
  `Status` varchar(20) NOT NULL DEFAULT '',
  `slot_number` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`),
  KEY `idx_parking_number` (`ParkingNumber`),
  KEY `idx_owner_contact` (`OwnerContactNumber`),
  KEY `idx_slot_status` (`slot_number`, `Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `vehicle_info` (`ID`, `ParkingNumber`, `VehicleCategory`, `VehicleCompanyname`, `RegistrationNumber`, `OwnerName`, `OwnerContactNumber`, `InTime`, `OutTime`, `ParkingCharge`, `Remark`, `Status`, `slot_number`) VALUES
(138, '72254', 'Four Wheeler', 'tata', 'py2055', 'varun', 9876543234, '2024-05-05 08:37:00', '2024-05-15 08:36:00', '1199.92', '', '', 'slot27'),
(139, '85121', 'Four Wheeler', 'tata', 'py2045', 'bala', 9876456788, '2024-05-16 08:44:00', '2024-05-23 08:45:00', '840.08', '', '', 'slot22'),
(140, '78889', 'Four Wheeler', 'tata', 'LO35', 'varun', 8967541237, '2024-05-05 15:23:00', '2024-05-05 10:26:00', '-24.75', '', '', 'slot33'),
(289, '46001', 'Four Wheeler', 'tata', 'py564678', 'varun', 8967541237, '2024-05-05 13:30:00', '2024-05-05 14:29:00', '', '', '', ''),
(381, '18360', 'Four Wheeler', 'hundai', 'py564678', 'varunDass', 8967541237, '2024-05-05 17:30:00', '2024-06-05 17:30:00', '3720.00', '', '', 'slot46'),
(382, '48920', 'Four Wheeler', 'tata', 'py5545', 'varun', 9876543566, '2024-05-05 20:31:00', '2024-05-06 18:38:00', '110.58', '', '', 'slot1'),
(383, '38416', 'Four Wheeler', 'tata', 'py555', '3333', 8765433333, '2024-05-05 18:36:00', '2024-05-08 18:35:00', '359.92', '', '', '');
