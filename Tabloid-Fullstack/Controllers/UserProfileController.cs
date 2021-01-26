﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Tabloid_Fullstack.Models;
using Tabloid_Fullstack.Repositories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Tabloid_Fullstack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileRepository _repo;
        public UserProfileController(IUserProfileRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("{firebaseUserId}")]
        public IActionResult GetUserProfile(string firebaseUserId)
        {
            var user = _repo.GetByFirebaseUserId(firebaseUserId);
            if (user.IsActive == false)
            {
                return Unauthorized();
            }

            return Ok(user);
        }

        [HttpGet]
        public IActionResult GetAllActive()
        {
            var currentUser = GetCurrentUserProfile();

            if (currentUser.UserTypeId != UserType.ADMIN_ID || currentUser.IsActive == false)
            {
                return Unauthorized();
            }

            var users = _repo.GetAllActive();
            return Ok(users);
        }

        [HttpGet("inactive")]
        public IActionResult GetAllInactive()
        {
            var currentUser = GetCurrentUserProfile();

            if (currentUser.UserTypeId != UserType.ADMIN_ID || currentUser.IsActive == false)
            {
                return Unauthorized();
            }

            var users = _repo.GetAllInactive();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Post(UserProfile userProfile)
        {
            userProfile.CreateDateTime = DateTime.Now;
            userProfile.UserTypeId = UserType.AUTHOR_ID;
            _repo.Add(userProfile);
            return CreatedAtAction(
                nameof(GetUserProfile),
                new { firebaseUserId = userProfile.FirebaseUserId },
                userProfile);
        }

        [HttpPut("{id}")]
        public IActionResult Activate(int id)
        {
            var currentUser = GetCurrentUserProfile();

            if (currentUser.UserTypeId != UserType.ADMIN_ID || currentUser.IsActive == false)
            {
                return Unauthorized();
            }

            _repo.Activate(id);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Deactivate(int id)
        {
            var currentUser = GetCurrentUserProfile();

            if (currentUser.UserTypeId != UserType.ADMIN_ID || currentUser.IsActive == false)
            {
                return Unauthorized();
            }

            _repo.Deactivate(id);
            return NoContent();
        }

        private UserProfile GetCurrentUserProfile()
        {
            var firebaseUserId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            return _repo.GetByFirebaseUserId(firebaseUserId);
        }
    }
}
