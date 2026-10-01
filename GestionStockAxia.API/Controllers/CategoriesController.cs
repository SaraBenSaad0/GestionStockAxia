using GestionStockAxia.API.Application.Commands.Categories;
using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Application.Queries.Categories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionStockAxia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<List<CategorieDto>>> GetAll()
        {
            var query = new GetAllCategoriesQuery();

            var categories = await _mediator.Send(query);

            return Ok(categories);
        }

        // GET: api/Categories/1
        [HttpGet("{id}")]
        public async Task<ActionResult<CategorieDto>> GetById(int id)
        {
            var query = new GetCategorieByIdQuery(id);

            var categorie = await _mediator.Send(query);

            if (categorie == null)
            {
                return NotFound();
            }

            return Ok(categorie);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<int>> Create(
            CreateCategorieCommand command)
        {
            var id = await _mediator.Send(command);

            return Ok(id);
        }

        // PUT: api/Categories/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCategorieCommand command)
        {
            command.IdCategorie = id;

            var result = await _mediator.Send(command);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/Categories/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteCategorieCommand(id);

            var result = await _mediator.Send(command);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}