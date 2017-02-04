-- phpMyAdmin SQL Dump
-- version 4.5.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Oct 06, 2016 at 05:30 AM
-- Server version: 5.7.11
-- PHP Version: 5.6.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `blog`
--

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `pid` int(11) NOT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `date_updated` timestamp NULL DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `tags` varchar(100) DEFAULT NULL,
  `topic` varchar(100) DEFAULT NULL,
  `thumbnail` varchar(256) DEFAULT NULL,
  `body_preview` varchar(10000) DEFAULT NULL,
  `body_markdown` varchar(10000) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`pid`, `date_created`, `date_updated`, `title`, `tags`, `topic`, `thumbnail`, `body_preview`, `body_markdown`) VALUES
(1, NULL, NULL, 'TitleTitleTitle', 'chrome;javascript;webdev;', 'Web Development', 'artisan-1.PNG', 'here is a small piece of sample text I will use to get the users interested in my post', '# MARKDOWN\r\n\r\n`code in here`\r\n\r\n~~strikethrough~~'),
(2, NULL, NULL, 'Another Title Here', 'semi;colons', 'topic', 'artisan-2.PNG', 'preview', '# some more markdown wooho\r\n\r\n**bold text**');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`pid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `pid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
