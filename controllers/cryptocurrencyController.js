const { default: mongoose } = require("mongoose");
const Cryptocurrency = require("../models/cryptocurrencyModel");

exports.getAllCryptocurrencies = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Get all Cryptocurrencies"
    try {
        const cryptocurrencies = await Cryptocurrency.find();
        res.status(200).json({
            status: "success",
            results: cryptocurrencies.length,
            data: { cryptocurrencies },
        });
    } catch (error) {
        res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.getOneCryptocurrency = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Get Cryptocurrency by symbol or ID"
    try {
        const { id } = req.params;
        let cryptocurrency;

        if (mongoose.Types.ObjectId.isValid(id)) {
            cryptocurrency = await Cryptocurrency.findById(id);
        } else {
            cryptocurrency = await Cryptocurrency.findOne({ symbol: id.toUpperCase() });
        }

        if (!cryptocurrency) {
            return res.status(404).json({
                status: "fail",
                message: `Cryptocurrency with ID or symbol '${id}' not found`,
            });
        }

        res.status(200).json({ status: "success", data: { cryptocurrency } });
    } catch (error) {
        res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.createCryptocurrency = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Create Cryptocurrency"
    try {
        const { name, symbol, current_price } = req.body;

        if (!name || !symbol || current_price === undefined) {
            return res.status(400).json({ status: "fail", message: "Missing required fields" });
        }

        // Prevent duplicate symbols
        const existingCrypto = await Cryptocurrency.findOne({ symbol: symbol.toUpperCase() });
        if (existingCrypto) {
            return res.status(409).json({ status: "fail", message: "Cryptocurrency symbol already exists" });
        }

        const cryptocurrency = await Cryptocurrency.create({
            name,
            symbol: symbol.toUpperCase(),
            current_price,
        });

        res.status(201).json({ status: "success", data: { cryptocurrency } });
    } catch (error) {
        console.error("Error creating cryptocurrency:", error);
        res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.createCryptocurrencyMany = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Create many Cryptocurrencies"
    try {
        const cryptocurrenciesData = req.body;

        if (!Array.isArray(cryptocurrenciesData) || cryptocurrenciesData.length === 0) {
            return res.status(400).json({ status: "fail", message: "Invalid data format" });
        }

        // Prevent duplicate symbols
        const existingSymbols = await Cryptocurrency.find({
            symbol: { $in: cryptocurrenciesData.map((crypto) => crypto.symbol.toUpperCase()) },
        });

        if (existingSymbols.length > 0) {
            return res.status(409).json({
                status: "fail",
                message: "Some cryptocurrency symbols already exist",
                duplicates: existingSymbols.map((crypto) => crypto.symbol),
            });
        }

        const cryptocurrencies = await Cryptocurrency.insertMany(
            cryptocurrenciesData.map((crypto) => ({
                name: crypto.name,
                symbol: crypto.symbol.toUpperCase(),
                current_price: crypto.current_price,
            }))
        );

        res.status(201).json({ status: "success", data: { cryptocurrencies } });
    } catch (error) {
        console.error("Error creating multiple cryptocurrencies:", error);
        res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.deleteCryptocurrency = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Delete Cryptocurrency by id"
    try {
        const { id } = req.params;
        const cryptocurrency = await Cryptocurrency.findByIdAndDelete(id);

        if (!cryptocurrency) {
            return res.status(404).json({ status: "fail", message: "Cryptocurrency ID not found" });
        }

        res.status(200).json({ status: "success", message: "Cryptocurrency deleted" });
    } catch (error) {
        res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.deleteCryptocurrenciesMany = async (req, res) => {
    // #swagger.tags = ["Cryptocurrencies"]
    // #swagger.summary = "Delete many Cryptocurrencies"
    try {
        const { symbols } = req.body;

        if (symbols && Array.isArray(symbols) && symbols.length > 0) {
            // Delete specific cryptocurrencies by symbol
            const deleteResult = await Cryptocurrency.deleteMany({ symbol: { $in: symbols.map((s) => s.toUpperCase()) } });

            if (deleteResult.deletedCount === 0) {
                return res.status(404).json({ status: "fail", message: "No matching cryptocurrencies found" });
            }

            return res.status(200).json({ status: "success", message: "Selected cryptocurrencies deleted" });
        } else {
            // Delete all cryptocurrencies if no symbols provided
            await Cryptocurrency.deleteMany();
            return res.status(200).json({ status: "success", message: "All cryptocurrencies deleted" });
        }
    } catch (error) {
        res.status(500).json({ status: "fail", message: error.message });
    }
};
